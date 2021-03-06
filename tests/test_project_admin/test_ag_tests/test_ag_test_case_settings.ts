import { mount, Wrapper } from '@vue/test-utils';

import {
    AGTestCase,
    AGTestCaseFeedbackConfig,
    AGTestSuite,
    HttpError,
} from 'ag-client-typescript';
import * as sinon from 'sinon';

import APIErrors from '@/components/api_errors.vue';
import AGTestCaseFdbkConfigPanel from '@/components/project_admin/ag_tests/ag_test_case_fdbk_config_panel.vue';
import AGTestCaseSettings from '@/components/project_admin/ag_tests/ag_test_case_settings.vue';

import * as data_ut from '@/tests/data_utils';
import {
    get_validated_input_text,
    set_validated_input_text,
    validated_input_is_valid
} from '@/tests/utils';

describe('AG test case settings form tests', () => {
    let wrapper: Wrapper<AGTestCaseSettings>;
    let component: AGTestCaseSettings;
    let ag_test_suite: AGTestSuite;
    let ag_case: AGTestCase;
    let ag_case_with_multiple_commands: AGTestCase;
    let default_case_feedback_config: AGTestCaseFeedbackConfig;

    beforeEach(() => {
        default_case_feedback_config = {
            visible: false,
            show_individual_commands: false
        };

        ag_test_suite = data_ut.make_ag_test_suite(
            data_ut.make_project(data_ut.make_course().pk).pk);
        ag_case = data_ut.make_ag_test_case(ag_test_suite.pk);

        ag_case_with_multiple_commands = data_ut.make_ag_test_case(ag_test_suite.pk);
        ag_case_with_multiple_commands.ag_test_commands = [
            data_ut.make_ag_test_command(ag_case_with_multiple_commands.pk),
            data_ut.make_ag_test_command(ag_case_with_multiple_commands.pk),
        ];

        wrapper = mount(AGTestCaseSettings, {
            propsData: {
                ag_test_case: ag_case
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        sinon.restore();
    });

    test('case name binding', async () => {
        let case_name_input = wrapper.findComponent({ref: 'name'});

        set_validated_input_text(case_name_input, "Case 1");
        await wrapper.vm.$nextTick();
        expect(validated_input_is_valid(case_name_input)).toBe(true);
        expect(component.d_ag_test_case!.name).toEqual("Case 1");

        component.d_ag_test_case!.name = "Case 2";
        await wrapper.vm.$nextTick();
        expect(get_validated_input_text(case_name_input)).toEqual("Case 2");
    });

    test('error - case name is blank', async () => {
        set_validated_input_text(wrapper.findComponent({ref: "name"}), 'Rain');
        await component.$nextTick();

        expect(wrapper.findComponent({ref: 'save_button'}).element).not.toBeDisabled();

        set_validated_input_text(wrapper.findComponent({ref: "name"}), ' ');
        await component.$nextTick();

        expect(wrapper.findComponent({ref: 'save_button'}).element).toBeDisabled();
    });

    test('save d_ag_case - successful', async () => {
        let save_case_stub = sinon.stub(component.d_ag_test_case!, 'save');

        wrapper.findComponent({ref: 'ag_test_case_settings_form'}).trigger('submit');
        await component.$nextTick();

        expect(save_case_stub.calledOnce).toBe(true);
    });

    test('save d_ag_case - unsuccessful', async () => {
        let save_case_stub = sinon.stub(component.d_ag_test_case!, 'save').returns(
            Promise.reject(
                new HttpError(
                    400,
                    {__all__: "An AG Test Case with this name already exists in the suite."}
                )
            )
        );

        wrapper.findComponent({ref: 'ag_test_case_settings_form'}).trigger('submit');
        await component.$nextTick();

        expect(save_case_stub.calledOnce).toBe(true);
        let api_errors = <APIErrors> wrapper.findComponent({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('FeedbackCongfigAGCase component only available when ag_test_case has more than ' +
         'one command',
         async () => {
        expect(component.d_ag_test_case!.ag_test_commands.length).toEqual(0);
        expect(wrapper.findComponent({ref: 'fdbk_panels'}).exists()).toBe(false);

        wrapper.setProps({ag_test_case: ag_case_with_multiple_commands});
        await component.$nextTick();

        expect(component.d_ag_test_case!.ag_test_commands.length).toEqual(2);
        expect(wrapper.findComponent({ref: 'fdbk_panels'}).exists()).toBe(true);

        let case_3 = data_ut.make_ag_test_case(ag_test_suite.pk);
        case_3.ag_test_commands = [
            data_ut.make_ag_test_command(case_3.pk)
        ];

        wrapper.setProps({ag_test_case: case_3});
        await component.$nextTick();

        expect(component.d_ag_test_case!.ag_test_commands.length).toEqual(1);
        expect(wrapper.findComponent({ref: 'fdbk_panels'}).exists()).toBe(false);
    });

    test('update config settings in ag_case_config_panel - changes reflected in ' +
         'ag_test_case_settings',
         async () => {
        wrapper.setProps({ag_test_case: ag_case_with_multiple_commands});
        await component.$nextTick();

        let past_limit_config_panel = wrapper.findComponent({ref: 'past_limit'});
        let past_limit_config_panel_component
            = <AGTestCaseFdbkConfigPanel>  past_limit_config_panel.vm;

        expect(past_limit_config_panel_component.d_feedback_config!.visible).toBe(false);
        expect(component.d_ag_test_case!.past_limit_submission_fdbk_config.visible).toBe(false);

        await wrapper.findAll('[data-testid=is_visible]').at(2).setChecked(true);

        expect(past_limit_config_panel_component.d_feedback_config!.visible).toBe(true);
        expect(component.d_ag_test_case!.past_limit_submission_fdbk_config.visible).toBe(true);

        expect(
            past_limit_config_panel_component.d_feedback_config!.show_individual_commands
        ).toBe(false);
        expect(
            component.d_ag_test_case!.past_limit_submission_fdbk_config.show_individual_commands
        ).toBe(false);

        await wrapper.findAll('[data-testid=show_individual_commands]').at(2).setChecked(true);

        expect(
            past_limit_config_panel_component.d_feedback_config!.show_individual_commands
        ).toBe(true);
        expect(
            component.d_ag_test_case!.past_limit_submission_fdbk_config.show_individual_commands
        ).toBe(true);
    });

    test('Checkboxes in ag case config panels do not react to changes in other panels',
         async () => {
        await wrapper.setProps({ag_test_case: ag_case_with_multiple_commands});

        expect(component.d_ag_test_case!.normal_fdbk_config.show_individual_commands).toBe(false);
        expect(
            component.d_ag_test_case!.ultimate_submission_fdbk_config.show_individual_commands
        ).toBe(false);
        expect(
            component.d_ag_test_case!.past_limit_submission_fdbk_config.show_individual_commands
        ).toBe(false);
        expect(
            component.d_ag_test_case!.staff_viewer_fdbk_config.show_individual_commands
        ).toBe(false);

        await wrapper.findAll('[data-testid=show_individual_commands]').at(3).setChecked(true);

        expect(component.d_ag_test_case!.normal_fdbk_config.show_individual_commands).toBe(false);
        expect(
        component.d_ag_test_case!.ultimate_submission_fdbk_config.show_individual_commands
        ).toBe(false);
        expect(
        component.d_ag_test_case!.past_limit_submission_fdbk_config.show_individual_commands
        ).toBe(false);
        expect(
        component.d_ag_test_case!.staff_viewer_fdbk_config.show_individual_commands
        ).toBe(true);
    });

    test('ag_test_case Watcher', async () => {
        await component.$nextTick();
        expect(component.d_ag_test_case!.name).toEqual(ag_case.name);

        expect(component.d_ag_test_case).toEqual(ag_case);

        wrapper.setProps({ag_test_case: ag_case_with_multiple_commands});
        await component.$nextTick();

        expect(component.d_ag_test_case).toEqual(ag_case_with_multiple_commands);
    });
});

