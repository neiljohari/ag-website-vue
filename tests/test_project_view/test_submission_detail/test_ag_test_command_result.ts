import { mount, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from 'sinon';

import AGTestCommandResult from '@/components/project_view/submission_detail/ag_test_command_result.vue';

import * as data_ut from '@/tests/data_utils';

let user: ag_cli.User;
let group: ag_cli.Group;
let submission: ag_cli.Submission;
let ag_test_command_result: ag_cli.AGTestCommandResultFeedback;

let get_ag_test_cmd_result_stdout_stub: sinon.SinonStub;
let get_ag_test_cmd_result_stderr_stub: sinon.SinonStub;
let get_ag_test_cmd_result_stdout_diff_stub: sinon.SinonStub;
let get_ag_test_cmd_result_stderr_diff_stub: sinon.SinonStub;
let get_ag_test_cmd_result_output_size_stub: sinon.SinonStub;

let diff_contents: string[];
let stdout_content: string;
let stderr_content: string;
let stdout_diff_content: string[];
let stderr_diff_content: string[];

let expected_and_actual = ag_cli.ValueFeedbackLevel.expected_and_actual;

beforeEach(() => {
    user = data_ut.make_user();
    group = data_ut.make_group(1, 1, {member_names: [user.username]});
    submission = data_ut.make_submission(group);
    ag_test_command_result = data_ut.make_ag_test_command_result_feedback(1);

    diff_contents = [
        '  one\r\n',
        '  two\n',
        '- left one\n',
        '- left two\n',
        '- left three\n',
        '  three\n',
        '+ right one\n',
        '+ right two\n',
        '  four\n',
        '  five\n'
    ];

    stdout_content = "stdout content";
    stderr_content = "stderr_content";
    stdout_diff_content = diff_contents;
    stderr_diff_content = diff_contents;

    get_ag_test_cmd_result_stdout_stub = sinon.stub(
        ag_cli.ResultOutput,
        'get_ag_test_cmd_result_stdout'
    ).returns(Promise.resolve(stdout_content));

    get_ag_test_cmd_result_stdout_diff_stub = sinon.stub(
        ag_cli.ResultOutput,
        'get_ag_test_cmd_result_stdout_diff'
    ).returns(Promise.resolve(stdout_diff_content));

    get_ag_test_cmd_result_stderr_stub = sinon.stub(
        ag_cli.ResultOutput,
        'get_ag_test_cmd_result_stderr'
    ).returns(Promise.resolve(stderr_content));

    get_ag_test_cmd_result_stderr_diff_stub = sinon.stub(
        ag_cli.ResultOutput,
        'get_ag_test_cmd_result_stderr_diff'
    ).returns(Promise.resolve(stderr_diff_content));

    get_ag_test_cmd_result_output_size_stub = sinon.stub(
        ag_cli.ResultOutput,
        'get_ag_test_cmd_result_output_size'
    ).returns(Promise.resolve(
        {
            stdout_size: 10,
            stderr_size: 10,
            stdout_diff_size: 10,
            stderr_diff_size: 10
        }
    ));
});

afterEach(() => {
    sinon.restore();
});

describe('show_fieldset/section tests', () => {
    let wrapper: Wrapper<AGTestCommandResult>;
    let d_ag_test_command_result: ag_cli.AGTestCommandResultFeedback;
    let fdbk_settings: ag_cli.AGTestCommandFeedbackConfig;

    beforeEach(() => {
        ag_test_command_result.timed_out = null;
    });

    test('show_correctness_fieldset - false', async () => {
        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        d_ag_test_command_result = wrapper.vm.ag_test_command_result;
        fdbk_settings = d_ag_test_command_result.fdbk_settings;

        expect(d_ag_test_command_result.return_code_correct).toBe(null);
        expect(d_ag_test_command_result.timed_out).toBe(null);
        expect(fdbk_settings.return_code_fdbk_level).not.toEqual(expected_and_actual);
        expect(d_ag_test_command_result.actual_return_code).toBe(null);
        expect(d_ag_test_command_result.expected_return_code).toBe(null);
        expect(d_ag_test_command_result.stdout_correct).toBe(null);
        expect(d_ag_test_command_result.stderr_correct).toBe(null);
        expect(wrapper.vm.show_correctness_fieldset).toBe(false);
    });

    test('show_correctness_fieldset - return_code_correct !== null', async () => {
        ag_test_command_result.return_code_correct = false;

        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        d_ag_test_command_result = wrapper.vm.ag_test_command_result;
        fdbk_settings = d_ag_test_command_result.fdbk_settings;

        expect(d_ag_test_command_result.return_code_correct).toBe(false);
        expect(d_ag_test_command_result.timed_out).toBe(null);
        expect(fdbk_settings.return_code_fdbk_level).not.toEqual(expected_and_actual);
        expect(d_ag_test_command_result.actual_return_code).toBe(null);
        expect(d_ag_test_command_result.stdout_correct).toBe(null);
        expect(d_ag_test_command_result.stderr_correct).toBe(null);
        expect(wrapper.vm.show_correctness_fieldset).toBe(true);
    });

    test('show_correctness_fieldset - timed_out === true', async () => {
        ag_test_command_result.timed_out = true;

        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        d_ag_test_command_result = wrapper.vm.ag_test_command_result;
        fdbk_settings = d_ag_test_command_result.fdbk_settings;

        expect(d_ag_test_command_result.return_code_correct).toBe(null);
        expect(d_ag_test_command_result.timed_out).toBe(true);
        expect(fdbk_settings.return_code_fdbk_level).not.toEqual(expected_and_actual);
        expect(d_ag_test_command_result.actual_return_code).toBe(null);
        expect(d_ag_test_command_result.expected_return_code).toBe(null);
        expect(d_ag_test_command_result.stdout_correct).toBe(null);
        expect(d_ag_test_command_result.stderr_correct).toBe(null);
        expect(wrapper.vm.show_correctness_fieldset).toBe(true);
    });

    test('show_correctness_fieldset - return_code_fdbk_level ' +
         '=== ValueFeedbackLevel.expected_and_actual',
         async () => {
        ag_test_command_result.fdbk_settings.return_code_fdbk_level = expected_and_actual;

        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        d_ag_test_command_result = wrapper.vm.ag_test_command_result;
        fdbk_settings = d_ag_test_command_result.fdbk_settings;

        expect(d_ag_test_command_result.return_code_correct).toBe(null);
        expect(d_ag_test_command_result.timed_out).toBe(null);
        expect(fdbk_settings.return_code_fdbk_level).toEqual(expected_and_actual);
        expect(d_ag_test_command_result.actual_return_code).toBe(null);
        expect(d_ag_test_command_result.expected_return_code).toBe(null);
        expect(d_ag_test_command_result.stdout_correct).toBe(null);
        expect(d_ag_test_command_result.stderr_correct).toBe(null);
        expect(wrapper.vm.show_correctness_fieldset).toBe(false);
    });

    test('show_correctness_fieldset - actual_return_code !== null', async () => {
        ag_test_command_result.fdbk_settings.return_code_fdbk_level = expected_and_actual;
        ag_test_command_result.actual_return_code = 1;

        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        d_ag_test_command_result = wrapper.vm.ag_test_command_result;
        fdbk_settings = d_ag_test_command_result.fdbk_settings;

        expect(d_ag_test_command_result.return_code_correct).toBe(null);
        expect(d_ag_test_command_result.timed_out).toBe(null);
        expect(fdbk_settings.return_code_fdbk_level).toEqual(expected_and_actual);
        expect(d_ag_test_command_result.actual_return_code).not.toBe(null);
        expect(d_ag_test_command_result.expected_return_code).toBe(null);
        expect(d_ag_test_command_result.stdout_correct).toBe(null);
        expect(d_ag_test_command_result.stderr_correct).toBe(null);
        expect(wrapper.vm.show_correctness_fieldset).toBe(true);
    });

    test('show_correctness_fieldset - expected_return_code !== null', async () => {
        ag_test_command_result.fdbk_settings.return_code_fdbk_level = expected_and_actual;
        ag_test_command_result.expected_return_code = ag_cli.ExpectedReturnCode.nonzero;

        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        d_ag_test_command_result = wrapper.vm.ag_test_command_result;
        fdbk_settings = d_ag_test_command_result.fdbk_settings;

        expect(d_ag_test_command_result.return_code_correct).toBe(null);
        expect(d_ag_test_command_result.timed_out).toBe(null);
        expect(fdbk_settings.return_code_fdbk_level).toEqual(expected_and_actual);
        expect(d_ag_test_command_result.actual_return_code).toBe(null);
        expect(d_ag_test_command_result.expected_return_code).not.toBe(null);
        expect(d_ag_test_command_result.stdout_correct).toBe(null);
        expect(d_ag_test_command_result.stderr_correct).toBe(null);
        expect(wrapper.vm.show_correctness_fieldset).toBe(true);
    });

    test('show_correctness_fieldset - stdout_correct !== null', async () => {
        ag_test_command_result.timed_out = null;
        ag_test_command_result.stdout_correct = true;
        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        d_ag_test_command_result = wrapper.vm.ag_test_command_result;
        fdbk_settings = d_ag_test_command_result.fdbk_settings;

        expect(d_ag_test_command_result.return_code_correct).toBe(null);
        expect(d_ag_test_command_result.timed_out).toBe(null);
        expect(fdbk_settings.return_code_fdbk_level).not.toEqual(expected_and_actual);
        expect(d_ag_test_command_result.actual_return_code).toBe(null);
        expect(d_ag_test_command_result.expected_return_code).toBe(null);
        expect(d_ag_test_command_result.stdout_correct).not.toBe(null);
        expect(d_ag_test_command_result.stderr_correct).toBe(null);
        expect(wrapper.vm.show_correctness_fieldset).toBe(true);
    });

    test('show_correctness_fieldset - stderr_correct !== null', async () => {
        ag_test_command_result.stderr_correct = true;

        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        d_ag_test_command_result = wrapper.vm.ag_test_command_result;
        fdbk_settings = d_ag_test_command_result.fdbk_settings;

        expect(d_ag_test_command_result.return_code_correct).toBe(null);
        expect(d_ag_test_command_result.timed_out).toBe(null);
        expect(fdbk_settings.return_code_fdbk_level).not.toEqual(expected_and_actual);
        expect(d_ag_test_command_result.actual_return_code).toBe(null);
        expect(d_ag_test_command_result.expected_return_code).toBe(null);
        expect(d_ag_test_command_result.stdout_correct).toBe(null);
        expect(d_ag_test_command_result.stderr_correct).not.toBe(null);
        expect(wrapper.vm.show_correctness_fieldset).toBe(true);
    });

    test('show_actual_and_expected_return_code - false', async () => {
        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        d_ag_test_command_result = wrapper.vm.ag_test_command_result;
        fdbk_settings = d_ag_test_command_result.fdbk_settings;
        expect(fdbk_settings.return_code_fdbk_level).not.toEqual(expected_and_actual);
        expect(d_ag_test_command_result.actual_return_code).toBe(null);
        expect(d_ag_test_command_result.expected_return_code).toBe(null);
        expect(wrapper.vm.show_actual_and_expected_return_code).toBe(false);
    });

    test('show_actual_and_expected_return_code - return_code_fdbk_level ' +
         '=== expected_and_actual',
         async () => {
        ag_test_command_result.fdbk_settings.return_code_fdbk_level = expected_and_actual;

        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        d_ag_test_command_result = wrapper.vm.ag_test_command_result;
        fdbk_settings = d_ag_test_command_result.fdbk_settings;

        expect(fdbk_settings.return_code_fdbk_level).toEqual(expected_and_actual);
        expect(d_ag_test_command_result.actual_return_code).toBe(null);
        expect(d_ag_test_command_result.expected_return_code).toBe(null);
        expect(wrapper.vm.show_actual_and_expected_return_code).toBe(false);
    });

    test('show_actual_and_expected_return_code - return_code_fdbk_level ' +
         '=== expected_and_actual && actual_return_code !== null',
         async () => {
        ag_test_command_result.fdbk_settings.return_code_fdbk_level = expected_and_actual;
        ag_test_command_result.actual_return_code = 0;

        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        d_ag_test_command_result = wrapper.vm.ag_test_command_result;
        fdbk_settings = d_ag_test_command_result.fdbk_settings;

        expect(fdbk_settings.return_code_fdbk_level).toEqual(expected_and_actual);
        expect(d_ag_test_command_result.actual_return_code).not.toBe(null);
        expect(d_ag_test_command_result.expected_return_code).toBe(null);
        expect(wrapper.vm.show_actual_and_expected_return_code).toBe(true);
        expect(wrapper.find('#actual-return-code-section').exists()).toBe(true);
        expect(wrapper.find('#expected-return-code-section').exists()).toBe(false);
    });

    test('show_actual_and_expected_return_code - return_code_fdbk_level ' +
         '=== expected_and_actual && expected_return_code !== null',
         async () => {
        ag_test_command_result.fdbk_settings.return_code_fdbk_level = expected_and_actual;
        ag_test_command_result.expected_return_code = ag_cli.ExpectedReturnCode.zero;

        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        d_ag_test_command_result = wrapper.vm.ag_test_command_result;
        fdbk_settings = d_ag_test_command_result.fdbk_settings;

        expect(fdbk_settings.return_code_fdbk_level).toEqual(expected_and_actual);
        expect(d_ag_test_command_result.actual_return_code).toBe(null);
        expect(d_ag_test_command_result.expected_return_code).not.toBe(null);
        expect(wrapper.vm.show_actual_and_expected_return_code).toBe(true);
        expect(wrapper.find('#actual-return-code-section').exists()).toBe(false);
        expect(wrapper.find('#expected-return-code-section').exists()).toBe(true);
    });

    test('show_stdout_diff - false', async () => {
        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        d_ag_test_command_result = wrapper.vm.ag_test_command_result;
        fdbk_settings = d_ag_test_command_result.fdbk_settings;

        expect(d_ag_test_command_result.stdout_correct).toBe(null);
        expect(fdbk_settings.stdout_fdbk_level).not.toEqual(expected_and_actual);
        expect(wrapper.vm.show_stdout_diff).toBe(false);
    });

    test('show_stdout_diff - stdout_correct === false && stdout_fdbk_level ' +
         '!== ValueFeedbackLevel.expected_and_actual',
         async () => {
        ag_test_command_result.stdout_correct = false;

        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        d_ag_test_command_result = wrapper.vm.ag_test_command_result;
        fdbk_settings = d_ag_test_command_result.fdbk_settings;

        expect(d_ag_test_command_result.stdout_correct).toBe(false);
        expect(fdbk_settings.stdout_fdbk_level).not.toEqual(expected_and_actual);
        expect(wrapper.vm.show_stdout_diff).toBe(false);
    });

    test('show_stdout_diff - stdout_correct === false && stdout_fdbk_level ' +
         '=== ValueFeedbackLevel.expected_and_actual',
         async () => {
        ag_test_command_result.stdout_correct = false;
        ag_test_command_result.fdbk_settings.stdout_fdbk_level = expected_and_actual;

        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        d_ag_test_command_result = wrapper.vm.ag_test_command_result;
        fdbk_settings = d_ag_test_command_result.fdbk_settings;

        expect(d_ag_test_command_result.stdout_correct).toBe(false);
        expect(fdbk_settings.stdout_fdbk_level).toEqual(expected_and_actual);
        expect(wrapper.vm.show_stdout_diff).toBe(true);
    });

    test('show_stderr_diff - false', async () => {
        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        d_ag_test_command_result = wrapper.vm.ag_test_command_result;
        fdbk_settings = d_ag_test_command_result.fdbk_settings;

        expect(d_ag_test_command_result.stderr_correct).toBe(null);
        expect(fdbk_settings.stderr_fdbk_level).not.toEqual(expected_and_actual);
        expect(wrapper.vm.show_stderr_diff).toBe(false);
    });

    test('show_stderr_diff - stderr_correct === false && stderr_fdbk_level ' +
         '!== ValueFeedbackLevel.expected_and_actual',
         async () => {
        ag_test_command_result.stderr_correct = false;

        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        d_ag_test_command_result = wrapper.vm.ag_test_command_result;
        fdbk_settings = d_ag_test_command_result.fdbk_settings;

        expect(d_ag_test_command_result.stderr_correct).toBe(false);
        expect(fdbk_settings.stderr_fdbk_level).not.toEqual(expected_and_actual);
        expect(wrapper.vm.show_stderr_diff).toBe(false);
    });

    test('show_stderr_diff - stderr_correct === false && stderr_fdbk_level ' +
         '=== ValueFeedbackLevel.expected_and_actual',
         async () => {
        ag_test_command_result.stderr_correct = false;
        ag_test_command_result.fdbk_settings.stderr_fdbk_level = expected_and_actual;

        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        d_ag_test_command_result = wrapper.vm.ag_test_command_result;
        fdbk_settings = d_ag_test_command_result.fdbk_settings;

        expect(d_ag_test_command_result.stderr_correct).toBe(false);
        expect(fdbk_settings.stderr_fdbk_level).toEqual(expected_and_actual);
        expect(wrapper.vm.show_stderr_diff).toBe(true);
    });
});

describe('AGTestCommandResult section exists tests', () => {
    let wrapper: Wrapper<AGTestCommandResult>;

    test('stdout_section - stdout_correct === null', async () => {
        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.ag_test_command_result.stdout_correct).toBeNull();
        expect(wrapper.find('#stdout-correctness-section').exists()).toBe(false);
        expect(wrapper.find('#stdout-diff-section').exists()).toBe(false);
    });

    test('stdout_section - stdout_correct === true', async () => {
        ag_test_command_result.stdout_correct = true;

        get_ag_test_cmd_result_output_size_stub.onFirstCall().returns(Promise.resolve(
            {
                stdout_size: 10,
                stderr_size: 10,
                stdout_diff_size: null,
                stderr_diff_size: 10
            }
        ));

        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.ag_test_command_result.stdout_correct).not.toBeNull();
        expect(wrapper.vm.ag_test_command_result.fdbk_settings.stdout_fdbk_level).not.toEqual(
            expected_and_actual
        );
        expect(get_ag_test_cmd_result_output_size_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stdout_diff_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_stdout_diff).toBeNull();
        expect(wrapper.find('#stdout-correctness-section').find(
            '.correct-icon'
        ).exists()).toBe(true);
        expect(wrapper.find('#stdout-diff-section').exists()).toBe(false);
    });

    test('stdout_section - stdout_correct === false and stdout_fdbk_level ' +
         '!== ValueFeedbackLevel.expected_and_actual',
         async () => {
        ag_test_command_result.stdout_correct = false;

        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.ag_test_command_result.stdout_correct).not.toBeNull();
        expect(wrapper.vm.ag_test_command_result.fdbk_settings.stdout_fdbk_level).not.toEqual(
            expected_and_actual
        );
        expect(wrapper.find('#stdout-correctness-section').find(
            '.incorrect-icon'
        ).exists()).toBe(true);
        expect(wrapper.find('#stdout-diff-section').exists()).toBe(false);
    });

    test('stdout_section - stdout_correct === false and stdout_fdbk_level ' +
         '=== ValueFeedbackLevel.expected_and_actual',
         async () => {
        ag_test_command_result.stdout_correct = false;
        ag_test_command_result.fdbk_settings.stdout_fdbk_level = expected_and_actual;

        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.ag_test_command_result.stdout_correct).not.toBeNull();
        expect(get_ag_test_cmd_result_output_size_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stdout_diff_stub.calledOnce).toBe(true);
        expect(wrapper.vm.ag_test_command_result.fdbk_settings.stdout_fdbk_level).toEqual(
            expected_and_actual
        );
        expect(wrapper.find('#stdout-correctness-section').find(
            '.incorrect-icon'
        ).exists()).toBe(true);
        expect(wrapper.find('#stdout-diff-section').exists()).toBe(true);
        expect(wrapper.find({ref: 'stdout_diff'}).exists()).toBe(true);
    });

    test('stdout_section - show_actual_stdout === true and stdout_content === null', async () => {
        ag_test_command_result.fdbk_settings.show_actual_stdout = true;

        get_ag_test_cmd_result_output_size_stub.onFirstCall().returns(Promise.resolve(
            {
                stdout_size: null,
                stderr_size: 10,
                stdout_diff_size: 10,
                stderr_diff_size: 10
            }
        ));

        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.ag_test_command_result.fdbk_settings.show_actual_stdout).toBe(true);
        expect(get_ag_test_cmd_result_output_size_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stdout_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_stdout_content).toBeNull();
        expect(wrapper.find('#actual-stdout-section').text()).toContain("No output");
    });

    test('stdout_section - show_actual_stdout === true and stdout_content !== null', async () => {
        ag_test_command_result.fdbk_settings.show_actual_stdout = true;

        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.ag_test_command_result.fdbk_settings.show_actual_stdout).toBe(true);
        expect(get_ag_test_cmd_result_output_size_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stdout_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_stdout_content).toEqual(Promise.resolve(stdout_content));
        expect(wrapper.find('#actual-stdout-section').text()).toContain(stdout_content);
    });

    test('stdout_section - show_actual_stdout === false', async () => {
        ag_test_command_result.fdbk_settings.show_actual_stdout = false;

        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.ag_test_command_result.fdbk_settings.show_actual_stdout).toBe(false);
        expect(wrapper.find('#actual-stdout-section').exists()).toBe(false);
    });

    test('stderr_section - stderr_correct === null', async () => {
        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.ag_test_command_result.stdout_correct).toBeNull();
        expect(wrapper.find('#stderr-correctness-section').exists()).toBe(false);
        expect(wrapper.find('#stderr-diff-section').exists()).toBe(false);
    });

    test('stderr_section - stderr_correct === true', async () => {
        ag_test_command_result.stderr_correct = true;

        get_ag_test_cmd_result_output_size_stub.onFirstCall().returns(Promise.resolve(
            {
                stdout_size: 10,
                stderr_size: 10,
                stdout_diff_size: 10,
                stderr_diff_size: null
            }
        ));

        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.ag_test_command_result.stderr_correct).toBe(true);
        expect(wrapper.vm.ag_test_command_result.fdbk_settings.stderr_fdbk_level).toEqual(
            ag_cli.ValueFeedbackLevel.no_feedback
        );
        expect(get_ag_test_cmd_result_output_size_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stderr_diff_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_stderr_diff).toBeNull();
        expect(wrapper.find('#stderr-correctness-section').find(
            '.correct-icon'
        ).exists()).toBe(true);
        expect(wrapper.find('#stderr-diff-section').exists()).toBe(false);
    });

    test('stderr_section - stderr_correct === false and stderr_fdbk_level ' +
         '!== ValueFeedbackLevel.expected_and_actual',
         async () => {
        ag_test_command_result.stderr_correct = false;

        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.ag_test_command_result.stderr_correct).not.toBeNull();
        expect(wrapper.vm.ag_test_command_result.fdbk_settings.stderr_fdbk_level).toEqual(
            ag_cli.ValueFeedbackLevel.no_feedback
        );
        expect(get_ag_test_cmd_result_output_size_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stdout_diff_stub.calledOnce).toBe(true);
        expect(wrapper.find('#stderr-correctness-section').find(
            '.incorrect-icon'
        ).exists()).toBe(true);
        expect(wrapper.find('#stderr-diff-section').exists()).toBe(false);
    });

    test('stderr_section - stderr_correct === false and stderr_fdbk_level ' +
         '=== ValueFeedbackLevel.expected_and_actual',
         async () => {
        ag_test_command_result.stderr_correct = false;
        ag_test_command_result.fdbk_settings.stderr_fdbk_level = expected_and_actual;

        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.ag_test_command_result.stderr_correct).not.toBeNull();
        expect(get_ag_test_cmd_result_output_size_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stderr_diff_stub.calledOnce).toBe(true);
        expect(wrapper.vm.ag_test_command_result.fdbk_settings.stderr_fdbk_level).toEqual(
            expected_and_actual
        );
        expect(wrapper.find('#stderr-correctness-section').find(
            '.incorrect-icon').exists()
        ).toBe(true);
        expect(wrapper.find('#stderr-diff-section').exists()).toBe(true);
        expect(wrapper.find({ref: 'stderr_diff'}).exists()).toBe(true);
    });

    test('stderr_section - show_actual_stderr === true and stderr_content === null', async () => {
        ag_test_command_result.fdbk_settings.show_actual_stderr = true;

        get_ag_test_cmd_result_output_size_stub.onFirstCall().returns(Promise.resolve(
            {
                stdout_size: 10,
                stderr_size: null,
                stdout_diff_size: 10,
                stderr_diff_size: 10
            }
        ));

        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.ag_test_command_result.fdbk_settings.show_actual_stderr).toBe(true);
        expect(get_ag_test_cmd_result_output_size_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stderr_stub.callCount).toEqual(0);
        expect(wrapper.vm.d_stderr_content).toBeNull();
        expect(wrapper.find('#actual-stderr-section').text()).toContain("No output");
    });

    test('stderr_section - show_actual_stderr === true and stderr_content !== null', async () => {
        ag_test_command_result.fdbk_settings.show_actual_stderr = true;

        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });
        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.ag_test_command_result.fdbk_settings.show_actual_stderr).toBe(true);
        expect(get_ag_test_cmd_result_output_size_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stderr_stub.calledOnce).toBe(true);
        expect(wrapper.vm.d_stderr_content).toEqual(Promise.resolve(stderr_content));
        expect(wrapper.find('#actual-stderr-section').text()).toContain(stderr_content);
    });
});

describe('AGTestCommandResult Watchers tests', () => {
    let wrapper: Wrapper<AGTestCommandResult>;

    beforeEach(async () => {
        wrapper = mount(AGTestCommandResult, {
            propsData: {
                submission: submission,
                ag_test_command_result: ag_test_command_result,
                fdbk_category: ag_cli.FeedbackCategory.max
            }
        });

        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }
    });

    test('submission Watcher', async () => {
        expect(wrapper.vm.submission).toEqual(submission);
        expect(get_ag_test_cmd_result_output_size_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stdout_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stderr_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stdout_diff_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stderr_diff_stub.calledOnce).toBe(true);

        let updated_submission = data_ut.make_submission(group);
        wrapper.setProps({submission: updated_submission});

        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(submission).not.toEqual(updated_submission);
        expect(wrapper.vm.submission).toEqual(updated_submission);
        expect(get_ag_test_cmd_result_output_size_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stdout_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stderr_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stdout_diff_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stderr_diff_stub.calledOnce).toBe(true);
    });

    test('ag_test_command_result Watcher', async () => {
        expect(wrapper.vm.ag_test_command_result).toEqual(ag_test_command_result);
        expect(get_ag_test_cmd_result_output_size_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stdout_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stderr_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stdout_diff_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stderr_diff_stub.calledOnce).toBe(true);

        let updated_ag_test_command_result = data_ut.make_ag_test_command_result_feedback(1);
        wrapper.setProps({ag_test_command_result: updated_ag_test_command_result});

        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(ag_test_command_result).not.toEqual(updated_ag_test_command_result);
        expect(wrapper.vm.ag_test_command_result).toEqual(updated_ag_test_command_result);
        expect(get_ag_test_cmd_result_output_size_stub.calledTwice).toBe(true);
        expect(get_ag_test_cmd_result_stdout_stub.calledTwice).toBe(true);
        expect(get_ag_test_cmd_result_stderr_stub.calledTwice).toBe(true);
        expect(get_ag_test_cmd_result_stdout_diff_stub.calledTwice).toBe(true);
        expect(get_ag_test_cmd_result_stderr_diff_stub.calledTwice).toBe(true);
    });

    test('fdbk_category Watcher', async () => {
        expect(wrapper.vm.fdbk_category).toEqual(ag_cli.FeedbackCategory.max);
        expect(get_ag_test_cmd_result_output_size_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stdout_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stderr_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stdout_diff_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stderr_diff_stub.calledOnce).toBe(true);

        wrapper.setProps({fdbk_category: ag_cli.FeedbackCategory.ultimate_submission});

        for (let i = 0; i < 4; ++i) {
            await wrapper.vm.$nextTick();
        }

        expect(wrapper.vm.fdbk_category).toEqual(ag_cli.FeedbackCategory.ultimate_submission);
        expect(get_ag_test_cmd_result_output_size_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stdout_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stderr_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stdout_diff_stub.calledOnce).toBe(true);
        expect(get_ag_test_cmd_result_stderr_diff_stub.calledOnce).toBe(true);
    });
});