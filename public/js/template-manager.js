(function ($) {
  // 템플릿 등록/삭제 결과 메시지는 SweetAlert2로만 표시합니다.
  const toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1800
  });

  function initList() {
    if (!$('#template-table').length) {
      return;
    }

    const table = $('#template-table').DataTable({
      processing: true,
      serverSide: true,
      columnDefs: [
        { targets: '_all', className: 'text-center' }
      ],
      ajax: {
        url: '/template/list',
        data(data) {
          data.project_type = $('#filter-project-type').val();
          data.framework = $('#filter-framework').val();
        }
      },
      columns: [
        { data: 'id' },
        { data: 'name' },
        { data: 'project_type' },
        { data: 'framework' },
        { data: 'version' },
        { data: 'file_size' },
        { data: 'download_count' },
        {
          data: 'created_at',
          render(value) {
            return value ? value.slice(0, 10) : '';
          }
        },
        {
          data: null,
          orderable: false,
          searchable: false,
          render(row) {
            return [
              `<a class="btn btn-sm btn-info" href="${row.detail_url}">상세</a>`,
              `<a class="btn btn-sm btn-warning" href="${row.edit_url}">수정</a>`,
              `<a class="btn btn-sm btn-success" href="${row.download_url}">다운로드</a>`,
              `<button class="btn btn-sm btn-danger delete-template" data-id="${row.id}">삭제</button>`
            ].join(' ');
          }
        }
      ],
      language: {
        search: '검색',
        lengthMenu: '_MENU_개씩 보기',
        info: '_TOTAL_개 중 _START_ - _END_',
        paginate: { previous: '이전', next: '다음' },
        processing: '불러오는 중입니다.'
      }
    });

    $('#template-search-button').on('click', function () {
      table.ajax.reload();
    });

    $('#template-table').on('click', '.delete-template', async function () {
      const id = $(this).data('id');
      const result = await Swal.fire({
        title: '삭제하시겠습니까?',
        text: '삭제된 템플릿은 복구할 수 없습니다.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '삭제',
        cancelButtonText: '취소'
      });

      if (!result.isConfirmed) {
        return;
      }

      await $.ajax({ url: `/template/${id}`, method: 'DELETE' });
      table.ajax.reload();
      toast.fire({ icon: 'success', title: '삭제되었습니다.' });
    });
  }

  function initCreate() {
    if (!$('#template-form').length) {
      return;
    }

    $('#description-editor').summernote({ height: 220, placeholder: '템플릿 설명을 입력하세요.' });

    const dropzone = new Dropzone('#template-dropzone', {
      url: '/template/upload',
      paramName: 'file',
      maxFiles: 1,
      maxFilesize: 50,
      acceptedFiles: '.zip,.tar.gz,.md,.json',
      addRemoveLinks: true,
      dictDefaultMessage: '파일을 끌어놓거나 클릭해서 업로드하세요.',
      init() {
        this.on('maxfilesexceeded', function (file) {
          this.removeFile(file);
          Swal.fire('업로드 제한', '파일은 1개만 업로드할 수 있습니다.', 'warning');
        });

        this.on('success', function (file, response) {
          $('#file-path').val(response.data.file_path);
          $('#file-name').val(response.data.file_name);
          $('#file-size').val(response.data.file_size);

          if (response.data.zip_preview.length > 0) {
            $('#zip-preview').html('<strong>ZIP 미리보기</strong><ul>' + response.data.zip_preview.map((item) => `<li>${item}</li>`).join('') + '</ul>');
          }

          toast.fire({ icon: 'success', title: '파일 업로드 완료' });
        });

        this.on('error', function (file, message) {
          const errorMessage = typeof message === 'string'
            ? message
            : message?.message || '파일 업로드 중 오류가 발생했습니다.';

          Swal.fire('업로드 실패', errorMessage, 'error');
        });
      }
    });

    $('#template-save-button').on('click', async function () {
      const formData = new FormData(document.getElementById('template-form'));
      const action = $('#template-form').data('action');
      const method = $('#template-form').data('method');
      const mode = $('#template-form').data('mode');
      formData.set('description', $('#description-editor').summernote('code'));

      try {
        const response = await $.ajax({
          url: action,
          method,
          data: formData,
          processData: false,
          contentType: false
        });

        await Swal.fire(mode === 'edit' ? '수정 완료' : '등록 완료', response.message, 'success');
        window.location.href = response.data.redirect_url;
      } catch (xhr) {
        const errors = xhr.responseJSON?.data?.errors || [];
        const detail = errors.length > 0
          ? errors.map((item) => item.msg || item.path).join('<br>')
          : xhr.responseJSON?.message || '입력값을 확인하세요.';

        Swal.fire('등록 실패', detail, 'error');
      }
    });

    $('#template-cancel-button').on('click', async function () {
      const result = await Swal.fire({
        title: $('#template-form').data('mode') === 'edit' ? '수정을 취소하시겠습니까?' : '등록을 취소하시겠습니까?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '이동',
        cancelButtonText: '계속 작성'
      });

      if (result.isConfirmed) {
        window.location.href = '/template';
      }
    });
  }

  $(function () {
    $('.select2').select2({ theme: 'bootstrap4', width: '100%' });
    $('.select2-tags').select2({ theme: 'bootstrap4', tags: true, width: '100%' });
    initList();
    initCreate();
  });
})(jQuery);
