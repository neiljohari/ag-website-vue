<template>
  <div id="instructor-files-component">
    <file-upload ref="instructor_files_upload"
                 @upload_files="add_instructor_files($event)"
                 :disable_upload_button="d_uploading">
    </file-upload>

    <div v-if="d_upload_progress !== null" class="progress-wrapper">
      <progress-bar :progress="d_upload_progress"></progress-bar>
    </div>

    <APIErrors ref="api_errors"></APIErrors>

    <div class="sidebar-container">
      <div class="sidebar-menu">
        <div :class="['sidebar-header', {'sidebar-header-closed': d_collapsed}]">
          <span class="sidebar-collapse-button" @click="d_collapsed = !d_collapsed">
            <i class="fas fa-bars"></i>
          </span>
          <span class="sidebar-header-text"
                v-if="!d_collapsed || current_filename === null">Uploaded Files</span>
        </div>

        <div class="sidebar-content" v-if="!d_collapsed">
          <single-instructor-file v-for="instructor_file of instructor_files"
                                  :key="instructor_file.pk"
                                  :file="instructor_file"
                                  @click="view_file(instructor_file)"
                                  class="sidebar-item"
                                  :class="{'active': current_filename === instructor_file.name}">
          </single-instructor-file>
        </div>
      </div>
      <div :class="['body', {'body-closed': d_collapsed}]" v-if="current_filename !== null">
        <view-file :filename="current_filename"
                   :file_contents="current_file_contents"
                   :progress="load_contents_progress"></view-file>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { InstructorFile, InstructorFileObserver, Project } from 'ag-client-typescript';

import APIErrors from "@/components/api_errors.vue";
import FileUpload from '@/components/file_upload.vue';
import ProgressBar from '@/components/progress_bar.vue';
import ViewFile from '@/components/view_file.vue';
import { handle_api_errors_async } from '@/error_handling';
import { BeforeDestroy, Created } from '@/lifecycle';
import { OpenFilesMixin } from '@/open_files_mixin';
import { SafeMap } from '@/safe_map';
import { toggle } from '@/utils';

import SingleInstructorFile from './single_instructor_file.vue';

@Component({
  components: {
    APIErrors,
    FileUpload,
    ProgressBar,
    SingleInstructorFile,
    ViewFile,
  }
})
export default class InstructorFiles extends OpenFilesMixin implements InstructorFileObserver,
                                                                       Created,
                                                                       BeforeDestroy {
  @Prop({required: true, type: Project})
  project!: Project;

  d_collapsed = false;
  d_uploading = false;
  d_upload_progress: number | null = null;

  // Do NOT modify the contents of this array!!
  get instructor_files(): ReadonlyArray<Readonly<InstructorFile>> {
    // Since this component is only used in project admin, we know that
    // this.project.instructor files will never be undefined.
    return this.project.instructor_files!;
  }

  created() {
    InstructorFile.subscribe(this);
  }

  beforeDestroy() {
    InstructorFile.unsubscribe(this);
  }

  view_file(file: InstructorFile) {
    this.open_file(file.name, (progress_callback) => file.get_content(progress_callback));
  }

  @handle_api_errors_async(handle_file_upload_errors)
  add_instructor_files(files: File[]) {
    this.d_upload_progress = null;
    (<APIErrors> this.$refs.api_errors).clear();
    return toggle(this, 'd_uploading', async () => {
      for (let file of files) {
        let file_to_update = this.instructor_files.find(item => item.name === file.name);
        if (file_to_update !== undefined) {
          await file_to_update.set_content(file, (event: ProgressEvent) => {
            if (event.lengthComputable) {
              this.d_upload_progress = 100 * (1.0 * event.loaded / event.total);
            }
          });
        }
        else {
          await InstructorFile.create(
            this.project.pk, file.name, file, (event: ProgressEvent) => {
              if (event.lengthComputable) {
                this.d_upload_progress = 100 * (1.0 * event.loaded / event.total);
              }
            }
          );
        }
      }
      this.d_upload_progress =  null;
      (<FileUpload> this.$refs.instructor_files_upload).clear_files();
    });
  }

  update_instructor_file_content_changed(instructor_file: InstructorFile, file_content: Blob) {
    if (instructor_file.project === this.project.pk) {
      this.update_file(instructor_file.name, Promise.resolve(file_content));
    }
  }

  update_instructor_file_deleted(instructor_file: InstructorFile) {
    if (instructor_file.project === this.project.pk) {
      this.delete_file(instructor_file.name);
    }
  }

  update_instructor_file_renamed(instructor_file: InstructorFile, old_name: string) {
    if (instructor_file.project === this.project.pk) {
      this.rename_file(old_name, instructor_file.name);
    }
  }

  update_instructor_file_created(instructor_file: InstructorFile) {}
}

function handle_file_upload_errors(component: InstructorFiles, error: unknown) {
  (<APIErrors> component.$refs.api_errors).show_errors_from_response(error);
}

</script>

<style scoped lang="scss">
@import "@/styles/colors.scss";
@import '@/styles/button_styles.scss';
@import '@/styles/collapsible_sidebar.scss';

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

#instructor-files-component {
  margin-top: .625rem;
}

.progress-wrapper {
  padding-top: .625rem;
}

$border-color: hsl(220, 40%, 94%);

@include collapsible-sidebar(
  $sidebar-width: 300px,
  $sidebar-header-height: 2.25rem,
  $border-color: $border-color,
  $include-top-border: true,
  $background-color: white,
  $active-color: $pebble-light
);

.sidebar-container {
  margin-top: .875rem;
}

.sidebar-header {
  padding-top: .5rem;
  padding-bottom: .5rem;
  font-weight: bold;
  font-size: 1.125rem;
}

.sidebar-collapse-button {
  color: $ocean-blue;
  outline: none;

  &:hover {
    color: darken($ocean-blue, 10);
  }
}

.sidebar-item {
  border-top: 1px solid $border-color;
}

.sidebar-container {
  .body {
    border-top: 1px solid hsl(220, 40%, 94%);
  }
}

</style>
