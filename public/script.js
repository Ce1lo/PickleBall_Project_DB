(() => {
  const api = {
    players: {
      list: () => $.getJSON('/api/players'),
      create: (d) => $.ajax({ url: '/api/players', method: 'POST', data: JSON.stringify(d), contentType: 'application/json' }),
      patch: (id, d) => $.ajax({ url: '/api/players/' + id, method: 'PATCH', data: JSON.stringify(d), contentType: 'application/json' }),
      remove: (id) => $.ajax({ url: '/api/players/' + id, method: 'DELETE' })
    },
    courts: {
      list: () => $.getJSON('/api/courts'),
      create: (d) => $.ajax({ url: '/api/courts', method: 'POST', data: JSON.stringify(d), contentType: 'application/json' }),
      patch: (id, d) => $.ajax({ url: '/api/courts/' + id, method: 'PATCH', data: JSON.stringify(d), contentType: 'application/json' }),
      remove: (id) => $.ajax({ url: '/api/courts/' + id, method: 'DELETE' })
    },
    reservations: {
      list: (date) => $.getJSON('/api/reservations' + (date ? ('?date=' + date) : '')),
      create: (d) => $.ajax({ url: '/api/reservations', method: 'POST', data: JSON.stringify(d), contentType: 'application/json' }),
      patch: (id, d) => $.ajax({ url: '/api/reservations/' + id, method: 'PATCH', data: JSON.stringify(d), contentType: 'application/json' }),
      remove: (id) => $.ajax({ url: '/api/reservations/' + id, method: 'DELETE' })
    },
    waitlist: {
      list: () => $.getJSON('/api/waitlist'),
      create: (d) => $.ajax({ url: '/api/waitlist', method: 'POST', data: JSON.stringify(d), contentType: 'application/json' }),
      patch: (id, d) => $.ajax({ url: '/api/waitlist/' + id, method: 'PATCH', data: JSON.stringify(d), contentType: 'application/json' }),
      remove: (id) => $.ajax({ url: '/api/waitlist/' + id, method: 'DELETE' })
    },
    events: {
      list: () => $.getJSON('/api/events'),
      create: (d) => $.ajax({ url: '/api/events', method: 'POST', data: JSON.stringify(d), contentType: 'application/json' }),
      patch: (id, d) => $.ajax({ url: '/api/events/' + id, method: 'PATCH', data: JSON.stringify(d), contentType: 'application/json' }),
      remove: (id) => $.ajax({ url: '/api/events/' + id, method: 'DELETE' }),
      registrations: (eid) => $.getJSON('/api/events/' + eid + '/registrations'),
      addRegistration: (eid, d) => $.ajax({ url: '/api/events/' + eid + '/registrations', method: 'POST', data: JSON.stringify(d), contentType: 'application/json' }),
      updateRegistration: (id, d) => $.ajax({ url: '/api/event-registrations/' + id, method: 'PATCH', data: JSON.stringify(d), contentType: 'application/json' }),
      removeRegistration: (id) => $.ajax({ url: '/api/event-registrations/' + id, method: 'DELETE' })
    },
    membershipPlans: {
      list: () => $.getJSON('/api/membership-plans'),
      create: (d) => $.ajax({ url: '/api/membership-plans', method: 'POST', data: JSON.stringify(d), contentType: 'application/json' }),
      patch: (id, d) => $.ajax({ url: '/api/membership-plans/' + id, method: 'PATCH', data: JSON.stringify(d), contentType: 'application/json' }),
      remove: (id) => $.ajax({ url: '/api/membership-plans/' + id, method: 'DELETE' })
    },
    memberships: {
      list: () => $.getJSON('/api/memberships'),
      create: (d) => $.ajax({ url: '/api/memberships', method: 'POST', data: JSON.stringify(d), contentType: 'application/json' }),
      patch: (id, d) => $.ajax({ url: '/api/memberships/' + id, method: 'PATCH', data: JSON.stringify(d), contentType: 'application/json' }),
      remove: (id) => $.ajax({ url: '/api/memberships/' + id, method: 'DELETE' })
    },
    payments: {
      list: () => $.getJSON('/api/payments'),
      create: (d) => $.ajax({ url: '/api/payments', method: 'POST', data: JSON.stringify(d), contentType: 'application/json' }),
      patch: (id, d) => $.ajax({ url: '/api/payments/' + id, method: 'PATCH', data: JSON.stringify(d), contentType: 'application/json' }),
      remove: (id) => $.ajax({ url: '/api/payments/' + id, method: 'DELETE' })
    },
    notifications: {
      list: () => $.getJSON('/api/notifications-queue'),
      create: (d) => $.ajax({ url: '/api/notifications-queue', method: 'POST', data: JSON.stringify(d), contentType: 'application/json' }),
      patch: (id, d) => $.ajax({ url: '/api/notifications-queue/' + id, method: 'PATCH', data: JSON.stringify(d), contentType: 'application/json' }),
      remove: (id) => $.ajax({ url: '/api/notifications-queue/' + id, method: 'DELETE' })
    },
    messages: {
      list: () => $.getJSON('/api/messages'),
      create: (d) => $.ajax({ url: '/api/messages', method: 'POST', data: JSON.stringify(d), contentType: 'application/json' })
    },
    reports: {
      membership: () => $.getJSON('/api/report/membership'),
      usage: () => $.getJSON('/api/report/reservations-usage'),
      revenue: () => $.getJSON('/api/report/revenue'),
      eventsCalendar: () => $.getJSON('/api/report/events-calendar'),
      messages: () => $.getJSON('/api/report/messages-history'),
      schedule: () => $.getJSON('/api/report/schedule')
    }
  };

  // Toast notification helper
  function showToast(message, type = 'success') {
    const container = $('#toast-container');
    const toast = $('<div class="toast"></div>').addClass(type);
    toast.append(`<div class="toast-message">${message}</div>`);
    container.append(toast);

    setTimeout(() => {
      toast.css('opacity', '0');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Currency formatter helper
  function formatCurrency(cents) {
    if (cents == null) return '0 ₫';
    const dong = cents; // already in dong, not cents
    return dong.toLocaleString('vi-VN') + ' ₫';
  }

  // Global Tooltip Logic
  $('body').append('<div id="global-tooltip" class="custom-tooltip"></div>');
  const tooltip = $('#global-tooltip');

  $(document).on('mouseenter', '[data-tooltip-html]', function (e) {
    const html = $(this).data('tooltip-html');
    if (!html) return;
    tooltip.html(html).show();
    moveTooltip(e);
  }).on('mouseleave', '[data-tooltip-html]', function () {
    tooltip.hide();
  }).on('mousemove', '[data-tooltip-html]', function (e) {
    moveTooltip(e);
  });

  function moveTooltip(e) {
    const w = tooltip.outerWidth();
    const h = tooltip.outerHeight();
    const winW = $(window).width();
    const winH = $(window).height();

    let left = e.pageX + 15;
    let top = e.pageY + 15;

    // Prevent overflow right
    if (left + w > winW) left = e.pageX - w - 15;
    // Prevent overflow bottom
    if (top + h > winH) top = e.pageY - h - 15;

    tooltip.css({ top: top, left: left });
  }

  // Helper to render table rows for generic data
  function renderTable(container, columns, data, opts = {}) {
    const thead = $('<thead><tr></tr></thead>');
    columns.forEach(col => {
      thead.find('tr').append(`<th>${col.label}</th>`);
    });
    if (opts.actions) {
      thead.find('tr').append('<th class="actions"></th>');
    }
    const tbody = $('<tbody></tbody>');
    if (data.length === 0) {
      tbody.append(`<tr><td colspan="${columns.length + (opts.actions ? 1 : 0)}" style="color:var(--muted);padding:20px;text-align:center;border:1px dashed var(--border);border-radius:8px">Không có dữ liệu</td></tr>`);
    } else {
      data.forEach(row => {
        const tr = $('<tr></tr>').attr('data-id', row.id);
        // Allow caller to assign custom CSS classes per row (e.g. highlight recent reservations)
        if (opts.rowClass) {
          const cls = opts.rowClass(row);
          if (cls) tr.addClass(cls);
        }
        columns.forEach(col => {
          const val = row[col.key];
          // Format expiry badge
          if (col.key === 'status' && opts.badge) {
            const cls = row.status;
            tr.append(`<td><span class="badge ${cls}">${val}</span></td>`);
          } else {
            tr.append(`<td>${val != null ? val : ''}</td>`);
          }
        });
        if (opts.actions) {
          const td = $('<td class="actions"></td>');
          const actionsWrapper = $('<div class="action-wrapper"></div>');
          if (opts.onEdit) {
            actionsWrapper.append(`<button class="btn" data-action="edit">Sửa</button>`);
          }
          if (opts.onDelete) {
            actionsWrapper.append(`<button class="btn danger" data-action="delete">Xoá</button>`);
          }
          // Append payment button or badge if enabled
          if (opts.payButton) {
            if (row.payment_status && row.payment_status === 'paid') {
              actionsWrapper.append(`<span class="badge paid">Đã TT</span>`);
            } else {
              actionsWrapper.append(`<button class="btn primary" data-action="pay">Thanh toán</button>`);
            }
          }
          td.append(actionsWrapper);
          tr.append(td);
        }
        tbody.append(tr);
      });
    }
    container.empty().append($('<div class="overflow-x-auto"></div>').append($('<table></table>').append(thead).append(tbody)));
  }

  // Drawer handling
  let drawerMode = null; // e.g. 'players', 'courts'
  let currentId = null;
  let originalRecord = null;
  function openDrawer(title, record, mode) {
    drawerMode = mode;
    currentId = record ? record.id : null;
    originalRecord = record ? { ...record } : null;
    $('#drawer-title').text(title);
    $('#drawer-content').empty();
    // dynamic form fields based on mode
    const fieldsDef = modules[mode].fields;
    fieldsDef.forEach(f => {
      const field = $('<div class="field"></div>');
      field.append(`<label>${f.label}</label>`);
      let input;
      if (f.type === 'select') {
        input = $('<select></select>').attr('id', 'f_' + f.key);
        (f.options || []).forEach(opt => {
          input.append(`<option value="${opt.value}">${opt.text}</option>`);
        });
      } else if (f.type === 'textarea') {
        input = $('<textarea></textarea>').attr('id', 'f_' + f.key).attr('rows', 3);
      } else {
        input = $('<input />').attr('id', 'f_' + f.key).attr('type', f.type || 'text');
      }
      field.append(input);
      $('#drawer-content').append(field);
    });
    // fill values if record exists
    if (record) {
      fieldsDef.forEach(f => {
        $('#f_' + f.key).val(record[f.key] != null ? record[f.key] : '');
      });
    } else {
      fieldsDef.forEach(f => {
        $('#f_' + f.key).val(f.default || '');
      });
      // Prefill reservation datetime fields based on currently selected date in Reservations view
      if (mode === 'reservations') {
        let selDate = $('#section-reservations .toolbar input[type=date]').val();
        if (!selDate) {
          const now = new Date();
          const y = now.getFullYear();
          const m = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          selDate = `${y}-${m}-${day}`;
        }
        // If selected date is today, default to next full hour; else 00:00-01:00
        const nowLocal = new Date();
        const y2 = nowLocal.getFullYear();
        const m2 = String(nowLocal.getMonth() + 1).padStart(2, '0');
        const d2 = String(nowLocal.getDate()).padStart(2, '0');
        const todayStr = `${y2}-${m2}-${d2}`;
        let startHour;
        if (selDate === todayStr) {
          startHour = nowLocal.getHours() + 1;
          if (startHour < 6) startHour = 6;
          if (startHour > 21) startHour = 21;
        } else {
          startHour = 0;
        }
        const endHour = startHour + 1;
        const pad2 = (n) => String(n).padStart(2, '0');
        $('#f_start_time').val(selDate + 'T' + pad2(startHour) + ':00');
        $('#f_end_time').val(selDate + 'T' + pad2(endHour) + ':00');
      }
    }
    // toggle delete button
    if (modules[mode].remove) {
      $('#delete-record').show();
    } else {
      $('#delete-record').hide();
    }
    $('#drawer').addClass('open');
  }
  function closeDrawer() {
    $('#drawer').removeClass('open');
    drawerMode = null;
    currentId = null;
    originalRecord = null;
  }
  $('#close-drawer').on('click', closeDrawer);

  $('#save-record').on('click', async () => {
    if (!drawerMode) return;
    const mod = modules[drawerMode];
    const data = {};
    mod.fields.forEach(f => {
      data[f.key] = $('#f_' + f.key).val();
    });
    try {
      let result;
      if (currentId) {
        // diff for patch
        const patch = {};
        for (const k in data) {
          if (!originalRecord || data[k] != originalRecord[k]) patch[k] = data[k];
        }
        if (Object.keys(patch).length === 0) {
          showToast('Không có gì thay đổi.', 'error');
          return;
        }
        result = await mod.patch(currentId, patch);
      } else {
        result = await mod.create(data);
      }
      // Special handling: if editing waitlist and a reservation is created (no priority field)
      if (drawerMode === 'waitlist' && result && result.priority === undefined) {
        showToast('Yêu cầu chờ đã được chuyển thành đặt sân.', 'success');
        // refresh both waitlist and reservations lists
        await modules.waitlist.load();
        await modules.reservations.load();
        closeDrawer();
        return;
      }
      await mod.load();
      closeDrawer();
      showToast(currentId ? 'Cập nhật thành công!' : 'Thêm mới thành công!', 'success');
    } catch (err) {
      showToast(err.responseJSON ? err.responseJSON.error : err.statusText, 'error');
    }
  });
  $('#delete-record').on('click', async () => {
    if (!drawerMode || !currentId) return;
    if (!confirm('Bạn có chắc muốn xoá?')) return;
    try {
      await modules[drawerMode].remove(currentId);
      await modules[drawerMode].load();
      closeDrawer();
      showToast('Xoá thành công!', 'success');
    } catch (err) {
      showToast(err.responseJSON ? err.responseJSON.error : err.statusText, 'error');
    }
  });

  // Modules for each section
  const modules = {
    players: {
      fields: [
        { key: 'name', label: 'Tên', type: 'text' },
        { key: 'phone', label: 'Điện thoại', type: 'text' },
        { key: 'email', label: 'Email', type: 'text' },
        { key: 'status', label: 'Tình trạng', type: 'select', options: [{ value: 'active', text: 'Còn hạn' }, { value: 'expired', text: 'Hết hạn' }, { value: 'none', text: 'Không' }] },
        { key: 'expiry', label: 'Ngày hết hạn', type: 'date' }
      ],
      load: async function () {
        const data = await api.players.list();
        // Remove duplicate entries by unique id
        const dedup = [];
        data.forEach(row => {
          if (!dedup.some(item => item.id === row.id)) dedup.push(row);
        });
        this.data = dedup;
        const container = $('#section-players');
        // toolbar
        const toolbar = $('<div class="toolbar"></div>');
        const qInput = $('<input placeholder="Tìm theo tên/điện thoại/email..."/>');
        const statusSel = $('<select><option value="">Tất cả</option><option value="active">Còn hạn</option><option value="expired">Hết hạn</option><option value="none">Không</option></select>');
        const refreshBtn = $('<button class="btn">Tải lại</button>').on('click', () => this.load());
        const addBtn = $('<button class="btn primary">Thêm</button>').on('click', () => {
          openDrawer('Thêm hội viên', null, 'players');
        });
        toolbar.append(qInput, statusSel, refreshBtn, addBtn);
        // table container
        const tableContainer = $('<div></div>');
        // helper to render the table based on current filter values
        const renderList = () => {
          const q = qInput.val() || '';
          const st = statusSel.val();
          const filtered = this.data.filter(row => {
            const hits = row.name.toLowerCase().includes(q.toLowerCase()) ||
              (row.phone || '').toLowerCase().includes(q.toLowerCase()) ||
              (row.email || '').toLowerCase().includes(q.toLowerCase());
            const statusMatch = st ? (row.status === st) : true;
            return hits && statusMatch;
          });
          // Render the filtered table
          renderTable(tableContainer,
            [
              { key: 'name', label: 'Tên' },
              { key: 'phone', label: 'Liên hệ' },
              { key: 'status', label: 'Hội viên' },
              { key: 'expiry', label: 'Hết hạn' }
            ],
            filtered,
            {
              actions: true,
              badge: true,
              onEdit: true,
              onDelete: true
            }
          );
        };
        // initial render
        renderList();
        // bind actions after each render via event delegation
        tableContainer.off('click').on('click', 'button[data-action]', (e) => {
          const id = parseInt($(e.target).closest('tr').data('id'), 10);
          const row = this.data.find(r => r.id === id);
          const action = $(e.target).data('action');
          if (action === 'edit') {
            openDrawer('Sửa hội viên', row, 'players');
          } else if (action === 'delete') {
            if (confirm('Bạn có chắc muốn xoá hội viên này?')) {
              api.players.remove(id).then(() => this.load());
            }
          }
        });
        container.empty().append($('<div class="card"></div>').append(toolbar, tableContainer));
        // filter events: do not reload data, just re-render list
        qInput.on('input', renderList);
        statusSel.on('change', renderList);
      },
      create: (d) => api.players.create(d),
      patch: (id, d) => api.players.patch(id, d),
      remove: (id) => api.players.remove(id)
    },
    courts: {
      fields: [
        { key: 'name', label: 'Tên sân', type: 'text' },
        { key: 'location', label: 'Vị trí', type: 'text' },
        { key: 'surface', label: 'Mặt sân', type: 'text' },
        { key: 'indoor', label: 'Trong nhà', type: 'select', options: [{ value: '0', text: 'Không' }, { value: '1', text: 'Có' }] },
        { key: 'lights', label: 'Đèn', type: 'select', options: [{ value: '0', text: 'Không' }, { value: '1', text: 'Có' }] },
        { key: 'is_active', label: 'Hoạt động', type: 'select', options: [{ value: '1', text: 'Có' }, { value: '0', text: 'Không' }] }
      ],
      load: async function () {
        const data = await api.courts.list();
        // Remove duplicates by id
        const dedup = [];
        data.forEach(row => {
          if (!dedup.some(item => item.id === row.id)) dedup.push(row);
        });
        this.data = dedup;
        const container = $('#section-courts');
        const toolbar = $('<div class="toolbar"></div>');
        const qInput = $('<input placeholder="Tìm theo tên/vị trí..."/>');
        const refreshBtn = $('<button class="btn">Tải lại</button>').on('click', () => this.load());
        const addBtn = $('<button class="btn primary">Thêm</button>').on('click', () => {
          openDrawer('Thêm sân', null, 'courts');
        });
        toolbar.append(qInput, refreshBtn, addBtn);
        const list = this.data.filter(row => {
          const q = qInput.val() || '';
          const hits = row.name.toLowerCase().includes(q.toLowerCase()) || (row.location || '').toLowerCase().includes(q.toLowerCase());
          return hits;
        });
        const tableContainer = $('<div></div>');
        renderTable(tableContainer,
          [
            { key: 'name', label: 'Tên' },
            { key: 'location', label: 'Vị trí' },
            { key: 'surface', label: 'Mặt sân' },
            { key: 'indoor', label: 'Trong nhà' },
            { key: 'lights', label: 'Đèn' },
            { key: 'is_active', label: 'Hoạt động' }
          ],
          list,
          {
            actions: true,
            onEdit: true,
            onDelete: true
          }
        );
        tableContainer.on('click', 'button[data-action]', (e) => {
          const id = parseInt($(e.target).closest('tr').data('id'), 10);
          const row = this.data.find(r => r.id === id);
          const action = $(e.target).data('action');
          if (action === 'edit') {
            openDrawer('Sửa sân', row, 'courts');
          } else if (action === 'delete') {
            if (confirm('Xoá sân này?')) {
              api.courts.remove(id).then(() => this.load());
            }
          }
        });
        container.empty().append($('<div class="card"></div>').append(toolbar, tableContainer));
        qInput.on('input', () => this.load());
      },
      create: (d) => api.courts.create({
        name: d.name,
        location: d.location,
        surface: d.surface,
        indoor: parseInt(d.indoor || '0', 10),
        lights: parseInt(d.lights || '0', 10),
        is_active: parseInt(d.is_active || '1', 10)
      }),
      patch: (id, d) => api.courts.patch(id, d),
      remove: (id) => api.courts.remove(id)
    },
    reservations: {
      fields: [
        { key: 'court_id', label: 'Sân', type: 'select', options: [] },
        { key: 'player_id', label: 'Người đặt', type: 'select', options: [] },
        { key: 'start_time', label: 'Bắt đầu', type: 'datetime-local' },
        { key: 'end_time', label: 'Kết thúc', type: 'datetime-local' },
        { key: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'booked', text: 'Đang đặt' }, { value: 'completed', text: 'Hoàn thành' }, { value: 'cancelled', text: 'Hủy' }] },
        { key: 'price_cents', label: 'Phí (VND)', type: 'number' },
        { key: 'payment_status', label: 'Thanh toán', type: 'select', options: [{ value: 'unpaid', text: 'Chưa thanh toán' }, { value: 'paid', text: 'Đã thanh toán' }] }
      ],
      load: async function () {
        // fetch reservations and remove duplicates by id
        const data = await api.reservations.list();
        const dedup = [];
        data.forEach(row => {
          if (!dedup.some(item => item.id === row.id)) dedup.push(row);
        });
        // keep all reservations even if there are multiple for the same slot; do not deduplicate by time
        this.data = dedup;
        // fetch all events once for grid overlay
        const eventsData = await api.events.list();
        // preload courts list for grid rendering and filters
        const courts = await api.courts.list();
        const container = $('#section-reservations');
        const toolbar = $('<div class="toolbar"></div>');
        // search and filters
        const qInput = $('<input placeholder="Tìm theo tên/sân..."/>');
        const courtSel = $('<select></select>');
        courtSel.append('<option value="">Tất cả sân</option>');
        courts.forEach(c => {
          courtSel.append(`<option value="${c.id}">${c.name}</option>`);
        });
        const prevBtn = $('<button class="btn" title="Ngày trước">←</button>');
        const dateInput = $('<input type="date"/>');
        const nextBtn = $('<button class="btn" title="Ngày kế tiếp">→</button>');
        const refreshBtn = $('<button class="btn">Tải lại</button>').on('click', () => this.load());
        const addBtn = $('<button class="btn primary">Thêm</button>').on('click', async () => {
          const courtsOpt = await api.courts.list();
          const players = await api.players.list();
          this.fields.find(f => f.key === 'court_id').options = courtsOpt.map(c => ({ value: c.id, text: c.name }));
          this.fields.find(f => f.key === 'player_id').options = players.map(p => ({ value: p.id, text: p.name }));
          openDrawer('Thêm đặt sân', null, 'reservations');
        });
        // assemble toolbar: search, court filter, prev/date/next, refresh and add
        toolbar.append(qInput, courtSel, prevBtn, dateInput, nextBtn, refreshBtn, addBtn);
        const tableContainer = $('<div></div>');
        const gridContainer = $('<div></div>').css('margin-top', '16px');
        // helper to render list and grid based on filters
        // format a Date as local YYYY-MM-DD (for <input type="date">)
        const formatLocalDate = (d) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        };

        const renderListAndGrid = () => {
          const q = (qInput.val() || '').toLowerCase();
          const selectedCourt = courtSel.val();
          const d = dateInput.val();
          // filter list
          const list = this.data.filter(row => {
            // search by player name or court name
            const matchesQ = !q || (row.player_name && row.player_name.toLowerCase().includes(q)) || (row.court_name && row.court_name.toLowerCase().includes(q));
            // filter by court
            const matchesCourt = selectedCourt ? (row.court_id === parseInt(selectedCourt, 10)) : true;
            // filter by date if selected
            const matchesDate = d ? row.start_time.slice(0, 10) === d : true;
            return matchesQ && matchesCourt && matchesDate;
          });
          // compute payment label and nearest upcoming reservation id
          const now = new Date();
          let nearestDiff = Infinity;
          let nearestId = null;
          list.forEach(r => {
            // label
            r.payment_label = `<span class="badge ${r.payment_status === 'paid' ? 'paid' : 'unpaid'}">${r.payment_status === 'paid' ? 'Đã TT' : 'Chưa TT'}</span>`;
            // compute upcoming difference
            try {
              const st = new Date(r.start_time.replace(' ', 'T'));
              const diff = st - now;
              if (diff >= 0 && diff < nearestDiff) {
                nearestDiff = diff;
                nearestId = r.id;
              }
            } catch (e) { }
          });
          // Render table with payment info
          renderTable(tableContainer,
            [
              { key: 'court_name', label: 'Sân' },
              { key: 'player_name', label: 'Người đặt' },
              { key: 'start_time', label: 'Bắt đầu' },
              { key: 'end_time', label: 'Kết thúc' },
              { key: 'status', label: 'Trạng thái' },
              { key: 'payment_label', label: 'Thanh toán' }
            ],
            list,
            {
              actions: true,
              onEdit: true,
              onDelete: true,
              payButton: true
            }
          );
          // Render grid only when a date is selected
          gridContainer.empty();
          if (d && courts && courts.length > 0) {
            const hours = [];
            for (let h = 6; h < 22; h++) hours.push(h);
            const table = $('<table class="schedule-table"></table>');
            const header = $('<tr></tr>');
            header.append('<th class="time-cell">Thời gian</th>');
            courts.forEach(c => {
              header.append(`<th>${c.name}</th>`);
            });
            table.append(header);
            hours.forEach(h => {
              const rowTr = $('<tr></tr>');
              const startLabel = (h < 10 ? '0' : '') + h + ':00';
              const endLabel = (h + 1 < 10 ? '0' : '') + (h + 1) + ':00';
              rowTr.append(`<td class="time-cell">${startLabel} - ${endLabel}</td>`);
              courts.forEach(c => {
                const cell = $('<td></td>');
                // check reservations overlapping this hour for this court
                list.forEach(r => {
                  if (r.court_id === c.id) {
                    const sH = parseInt(r.start_time.substr(11, 2), 10);
                    const sM = parseInt(r.start_time.substr(14, 2), 10);
                    const eH = parseInt(r.end_time.substr(11, 2), 10);
                    const eM = parseInt(r.end_time.substr(14, 2), 10);
                    const startMin = sH * 60 + sM;
                    const endMin = eH * 60 + eM;
                    const cellStart = h * 60;
                    const cellEnd = (h + 1) * 60;
                    if (startMin < cellEnd && endMin > cellStart) {
                      cell.addClass('reserved');
                      // Custom Tooltip Content
                      const tooltipHtml = `
                              <h4>${r.player_name}</h4>
                              <p><strong>Thời gian:</strong> ${r.start_time.substr(11, 5)} - ${r.end_time.substr(11, 5)}</p>
                              <p><strong>Trạng thái:</strong> ${r.status === 'booked' ? 'Đã đặt' : r.status === 'completed' ? 'Hoàn thành' : 'Hủy'}</p>
                              <p><strong>Thanh toán:</strong> ${r.payment_status === 'paid' ? '<span class="text-emerald-400">Đã thanh toán</span>' : '<span class="text-amber-400">Chưa thanh toán</span>'}</p>
                              <p><strong>Giá:</strong> ${formatCurrency(r.price_cents)}</p>
                            `;
                      cell.attr('data-tooltip-html', tooltipHtml);
                    }
                  }
                });
                // check events overlapping this hour for this court or all courts
                const eventsOnDate = eventsData.filter(ev => {
                  if (!ev.start_time || !ev.end_time) return false;
                  const startDate = ev.start_time.slice(0, 10);
                  const endDate = ev.end_time.slice(0, 10);
                  return (startDate <= d && endDate >= d);
                });
                eventsOnDate.forEach(ev => {
                  if (ev.court_id === c.id || ev.court_id == null) {
                    const eSH = parseInt(ev.start_time.substr(11, 2), 10);
                    const eSM = parseInt(ev.start_time.substr(14, 2), 10);
                    const eEH = parseInt(ev.end_time.substr(11, 2), 10);
                    const eEM = parseInt(ev.end_time.substr(14, 2), 10);
                    const evStartMin = eSH * 60 + eSM;
                    const evEndMin = eEH * 60 + eEM;
                    const cellStart = h * 60;
                    const cellEnd = (h + 1) * 60;
                    if (evStartMin < cellEnd && evEndMin > cellStart) {
                      cell.removeClass('reserved');
                      cell.addClass('event');
                      const tooltipHtml = `
                              <h4>${ev.name || 'Sự kiện'}</h4>
                              <p><strong>Thời gian:</strong> ${ev.start_time.substr(11, 5)} - ${ev.end_time.substr(11, 5)}</p>
                              <p><strong>Phí:</strong> ${formatCurrency(ev.fee_cents)}</p>
                              <p><strong>Số lượng:</strong> ${ev.max_participants || 'Không giới hạn'}</p>
                            `;
                      cell.attr('data-tooltip-html', tooltipHtml);
                    }
                  }
                });
                rowTr.append(cell);
              });
              table.append(rowTr);
            });
            gridContainer.append($('<div class="card"></div>').append('<h3>Lịch theo giờ</h3>', table));
          }
        };
        // set default date to today
        (function setDefaultDate() {
          const now = new Date();
          const y = now.getFullYear();
          const m = String(now.getMonth() + 1).padStart(2, '0');
          const d = String(now.getDate()).padStart(2, '0');
          dateInput.val(`${y}-${m}-${d}`);
        }).call(this);
        // initial render
        renderListAndGrid();
        // handle actions on table rows
        tableContainer.off('click').on('click', 'button[data-action]', async (e) => {
          const id = parseInt($(e.target).closest('tr').data('id'), 10);
          const row = this.data.find(r => r.id === id);
          const action = $(e.target).data('action');
          if (action === 'edit') {
            const courtsOpt = await api.courts.list();
            const players = await api.players.list();
            this.fields.find(f => f.key === 'court_id').options = courtsOpt.map(c => ({ value: c.id, text: c.name }));
            this.fields.find(f => f.key === 'player_id').options = players.map(p => ({ value: p.id, text: p.name }));
            const rcopy = { ...row };
            rcopy.start_time = row.start_time.replace(' ', 'T');
            rcopy.end_time = row.end_time.replace(' ', 'T');
            openDrawer('Sửa đặt sân', rcopy, 'reservations');
          } else if (action === 'delete') {
            if (confirm('Xoá đặt sân này?')) {
              api.reservations.remove(id).then(() => this.load());
            }
          } else if (action === 'pay') {
            // Set pending payment and switch to payments tab
            window.pendingPaymentReservation = row;
            $('nav button[data-section="payments"]').click();
          }
        });
        // append content
        container.empty().append($('<div class="card"></div>').append(toolbar, tableContainer, gridContainer));
        // filter change events
        qInput.on('input', renderListAndGrid);
        courtSel.on('change', renderListAndGrid);
        dateInput.on('change', renderListAndGrid);
        // next/prev buttons adjust date
        prevBtn.on('click', async () => {
          let current = dateInput.val();
          let dt;
          if (current) dt = new Date(current + 'T00:00:00'); else dt = new Date();
          dt.setDate(dt.getDate() - 1);
          // Use local date string to avoid UTC shift issues
          dateInput.val(formatLocalDate(dt)).trigger('change');
        });
        nextBtn.on('click', async () => {
          let current = dateInput.val();
          let dt;
          if (current) dt = new Date(current + 'T00:00:00'); else dt = new Date();
          dt.setDate(dt.getDate() + 1);
          // Use local date string to avoid UTC shift issues
          dateInput.val(formatLocalDate(dt)).trigger('change');
        });
        // show schedule in right panel
        $('#schedule-view').show();
        loadSchedule();
      },
      create: (d) => api.reservations.create({
        court_id: parseInt(d.court_id, 10),
        player_id: parseInt(d.player_id, 10),
        start_time: d.start_time.replace('T', ' '),
        end_time: d.end_time.replace('T', ' '),
        status: d.status,
        price_cents: parseInt(d.price_cents || '0', 10)
      }),
      patch: (id, d) => {
        if (d.start_time) d.start_time = d.start_time.replace('T', ' ');
        if (d.end_time) d.end_time = d.end_time.replace('T', ' ');
        return api.reservations.patch(id, d);
      },
      remove: (id) => api.reservations.remove(id)
    },
    waitlist: {
      fields: [
        { key: 'court_id', label: 'Sân', type: 'select', options: [] },
        { key: 'player_id', label: 'Người đăng ký', type: 'select', options: [] },
        { key: 'start_time', label: 'Bắt đầu', type: 'datetime-local' },
        { key: 'end_time', label: 'Kết thúc', type: 'datetime-local' },
        { key: 'priority', label: 'Ưu tiên', type: 'number' },
        { key: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'waiting', text: 'Đợi' }, { value: 'notified', text: 'Đã thông báo' }, { value: 'booked', text: 'Đã đặt' }, { value: 'cancelled', text: 'Hủy' }, { value: 'expired', text: 'Hết hạn' }] }
      ],
      load: async function () {
        const data = await api.waitlist.list();
        // Remove duplicates by id
        const dedup = [];
        data.forEach(row => {
          if (!dedup.some(item => item.id === row.id)) dedup.push(row);
        });
        this.data = dedup;
        const container = $('#section-waitlist');
        const toolbar = $('<div class="toolbar"></div>');
        const refreshBtn = $('<button class="btn">Tải lại</button>').on('click', () => this.load());
        const addBtn = $('<button class="btn primary">Thêm</button>').on('click', async () => {
          const courts = await api.courts.list();
          const players = await api.players.list();
          this.fields.find(f => f.key === 'court_id').options = courts.map(c => ({ value: c.id, text: c.name }));
          this.fields.find(f => f.key === 'player_id').options = players.map(p => ({ value: p.id, text: p.name }));
          openDrawer('Thêm hàng chờ', null, 'waitlist');
        });
        toolbar.append(refreshBtn, addBtn);
        const tableContainer = $('<div></div>');
        renderTable(tableContainer,
          [
            { key: 'court_name', label: 'Sân' },
            { key: 'player_name', label: 'Người đợi' },
            { key: 'start_time', label: 'Bắt đầu' },
            { key: 'end_time', label: 'Kết thúc' },
            { key: 'priority', label: 'Ưu tiên' },
            { key: 'status', label: 'Trạng thái' }
          ],
          data,
          { actions: true, onEdit: true, onDelete: true }
        );
        tableContainer.on('click', 'button[data-action]', async (e) => {
          const id = parseInt($(e.target).closest('tr').data('id'), 10);
          const row = this.data.find(r => r.id === id);
          const action = $(e.target).data('action');
          if (action === 'edit') {
            const courts = await api.courts.list();
            const players = await api.players.list();
            this.fields.find(f => f.key === 'court_id').options = courts.map(c => ({ value: c.id, text: c.name }));
            this.fields.find(f => f.key === 'player_id').options = players.map(p => ({ value: p.id, text: p.name }));
            const rcopy = { ...row };
            rcopy.start_time = row.start_time.replace(' ', 'T');
            rcopy.end_time = row.end_time.replace(' ', 'T');
            openDrawer('Sửa hàng chờ', rcopy, 'waitlist');
          } else if (action === 'delete') {
            if (confirm('Xoá?')) {
              api.waitlist.remove(id).then(() => this.load());
            }
          }
        });
        container.empty().append($('<div class="card"></div>').append(toolbar, tableContainer));
      },
      create: (d) => api.waitlist.create({
        court_id: parseInt(d.court_id, 10),
        player_id: parseInt(d.player_id, 10),
        start_time: d.start_time.replace('T', ' '),
        end_time: d.end_time.replace('T', ' '),
        priority: parseInt(d.priority || '0', 10),
        status: d.status
      }),
      patch: (id, d) => {
        if (d.start_time) d.start_time = d.start_time.replace('T', ' ');
        if (d.end_time) d.end_time = d.end_time.replace('T', ' ');
        return api.waitlist.patch(id, d);
      },
      remove: (id) => api.waitlist.remove(id)
    },
    events: {
      fields: [
        { key: 'name', label: 'Tên sự kiện', type: 'text' },
        { key: 'start_time', label: 'Bắt đầu', type: 'datetime-local' },
        { key: 'end_time', label: 'Kết thúc', type: 'datetime-local' },
        { key: 'court_id', label: 'Sân (tuỳ chọn)', type: 'select', options: [] },
        { key: 'fee_cents', label: 'Phí (VND)', type: 'number' },
        { key: 'max_participants', label: 'Số lượng tối đa', type: 'number' }
      ],
      load: async function () {
        const data = await api.events.list();
        const dedup = [];
        data.forEach(row => {
          if (!dedup.some(item => item.id === row.id)) dedup.push(row);
        });
        this.data = dedup;
        const container = $('#section-events');
        const toolbar = $('<div class="toolbar"></div>');
        const refreshBtn = $('<button class="btn">Tải lại</button>').on('click', () => this.load());
        const addBtn = $('<button class="btn primary">Thêm</button>').on('click', async () => {
          const courts = await api.courts.list();
          const opts = [{ value: '', text: 'Không' }].concat(courts.map(c => ({ value: c.id, text: c.name })));
          this.fields.find(f => f.key === 'court_id').options = opts;
          openDrawer('Thêm sự kiện', null, 'events');
        });
        toolbar.append(refreshBtn, addBtn);
        const tableContainer = $('<div></div>');
        renderTable(tableContainer,
          [
            { key: 'name', label: 'Tên' },
            { key: 'start_time', label: 'Bắt đầu' },
            { key: 'end_time', label: 'Kết thúc' },
            { key: 'court_name', label: 'Sân' },
            { key: 'fee_cents', label: 'Phí' },
            { key: 'max_participants', label: 'Max' }
          ],
          data,
          { actions: true, onEdit: true, onDelete: true }
        );
        tableContainer.on('click', 'button[data-action]', async (e) => {
          const id = parseInt($(e.target).closest('tr').data('id'), 10);
          const row = this.data.find(r => r.id === id);
          const action = $(e.target).data('action');
          if (action === 'edit') {
            const courts = await api.courts.list();
            const opts = [{ value: '', text: 'Không' }].concat(courts.map(c => ({ value: c.id, text: c.name })));
            this.fields.find(f => f.key === 'court_id').options = opts;
            const rcopy = { ...row };
            rcopy.start_time = row.start_time.replace(' ', 'T');
            rcopy.end_time = row.end_time.replace(' ', 'T');
            openDrawer('Sửa sự kiện', rcopy, 'events');
          } else if (action === 'delete') {
            if (confirm('Xoá?')) {
              api.events.remove(id).then(() => this.load());
            }
          }
        });
        container.empty().append($('<div class="card"></div>').append(toolbar, tableContainer));
      },
      create: (d) => api.events.create({
        name: d.name,
        start_time: d.start_time.replace('T', ' '),
        end_time: d.end_time.replace('T', ' '),
        court_id: d.court_id ? parseInt(d.court_id, 10) : null,
        fee_cents: parseInt(d.fee_cents || '0', 10),
        max_participants: parseInt(d.max_participants || '0', 10)
      }),
      patch: (id, d) => {
        if (d.start_time) d.start_time = d.start_time.replace('T', ' ');
        if (d.end_time) d.end_time = d.end_time.replace('T', ' ');
        return api.events.patch(id, d);
      },
      remove: (id) => api.events.remove(id)
    },
    memberships: {
      fields: [
        { key: 'player_id', label: 'Hội viên', type: 'select', options: [] },
        { key: 'plan_id', label: 'Gói', type: 'select', options: [] },
        { key: 'start_date', label: 'Ngày bắt đầu', type: 'date' },
        { key: 'end_date', label: 'Ngày kết thúc', type: 'date' },
        { key: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', text: 'Hoạt động' }, { value: 'cancelled', text: 'Hủy' }, { value: 'expired', text: 'Hết hạn' }] }
      ],
      load: async function () {
        const data = await api.memberships.list();
        const dedup = [];
        data.forEach(row => {
          if (!dedup.some(item => item.id === row.id)) dedup.push(row);
        });
        this.data = dedup;
        const container = $('#section-memberships');
        const toolbar = $('<div class="toolbar"></div>');
        const refreshBtn = $('<button class="btn">Tải lại</button>').on('click', () => this.load());
        const addBtn = $('<button class="btn primary">Thêm</button>').on('click', async () => {
          const players = await api.players.list();
          const plans = await api.membershipPlans.list();
          this.fields.find(f => f.key === 'player_id').options = players.map(p => ({ value: p.id, text: p.name }));
          this.fields.find(f => f.key === 'plan_id').options = plans.map(p => ({ value: p.id, text: p.name }));
          openDrawer('Thêm thẻ hội viên', null, 'memberships');
        });
        toolbar.append(refreshBtn, addBtn);
        const tableContainer = $('<div></div>');
        renderTable(tableContainer,
          [
            { key: 'player_name', label: 'Hội viên' },
            { key: 'plan_name', label: 'Gói' },
            { key: 'start_date', label: 'Bắt đầu' },
            { key: 'end_date', label: 'Kết thúc' },
            { key: 'status', label: 'Trạng thái' }
          ],
          data,
          { actions: true, onEdit: true, onDelete: true }
        );
        tableContainer.on('click', 'button[data-action]', async (e) => {
          const id = parseInt($(e.target).closest('tr').data('id'), 10);
          const row = this.data.find(r => r.id === id);
          const action = $(e.target).data('action');
          if (action === 'edit') {
            const players = await api.players.list();
            const plans = await api.membershipPlans.list();
            this.fields.find(f => f.key === 'player_id').options = players.map(p => ({ value: p.id, text: p.name }));
            this.fields.find(f => f.key === 'plan_id').options = plans.map(p => ({ value: p.id, text: p.name }));
            openDrawer('Sửa thẻ hội viên', row, 'memberships');
          } else if (action === 'delete') {
            if (confirm('Xoá?')) {
              api.memberships.remove(id).then(() => this.load());
            }
          }
        });
        container.empty().append($('<div class="card"></div>').append(toolbar, tableContainer));
      },
      create: (d) => api.memberships.create({
        player_id: parseInt(d.player_id, 10),
        plan_id: parseInt(d.plan_id, 10),
        start_date: d.start_date,
        end_date: d.end_date,
        status: d.status
      }),
      patch: (id, d) => api.memberships.patch(id, d),
      remove: (id) => api.memberships.remove(id)
    },
    payments: {
      fields: [
        { key: 'reservation_id', label: 'Mã đặt sân (ID)', type: 'number' },
        { key: 'amount_cents', label: 'Số tiền (VND)', type: 'number' },
        { key: 'payment_method', label: 'Phương thức', type: 'select', options: [{ value: 'cash', text: 'Tiền mặt' }, { value: 'transfer', text: 'Chuyển khoản' }, { value: 'card', text: 'Thẻ' }] },
        { key: 'payment_date', label: 'Ngày thanh toán', type: 'datetime-local' },
        { key: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'completed', text: 'Hoàn thành' }, { value: 'pending', text: 'Chờ xử lý' }, { value: 'failed', text: 'Thất bại' }] }
      ],
      load: async function () {
        const container = $('#section-payments');

        // Check if there is a pending payment from Reservations view
        if (window.pendingPaymentReservation) {
          const res = window.pendingPaymentReservation;
          window.pendingPaymentReservation = null; // Clear it

          // Check if payment already exists for this reservation
          let existingPayment = null;
          try {
            const allPayments = await api.payments.list();
            existingPayment = allPayments.find(p => p.reservation_id === res.id && p.source_type === 'reservation');
          } catch (e) { console.error(e); }

          const isUpdate = !!existingPayment;
          const title = isUpdate ? 'Cập nhật thanh toán' : 'Thanh toán đặt sân';
          const btnLabel = isUpdate ? 'Cập nhật' : 'Xác nhận thanh toán';

          const formCard = $('<div class="card" style="max-width:600px;margin:0 auto"></div>');
          formCard.append(`<h3>${title} #${res.id}</h3>`);

          const info = `
                  <div style="margin-bottom:20px;padding:15px;background:rgba(15,23,42,0.5);border-radius:8px">
                    <p><strong>Người đặt:</strong> ${res.player_name}</p>
                    <p><strong>Sân:</strong> ${res.court_name}</p>
                    <p><strong>Thời gian:</strong> ${res.start_time} - ${res.end_time}</p>
                    <p><strong>Số tiền:</strong> <span style="font-size:1.2em;color:#10b981;font-weight:bold">${formatCurrency(res.price_cents)}</span></p>
                  </div>
                `;
          formCard.append(info);

          const form = $('<div class="form-group"></div>');
          // Payment Method
          form.append('<label style="display:block;margin-bottom:8px;font-weight:600">Phương thức thanh toán</label>');
          const methodSel = $('<select id="pay_method" style="width:100%;margin-bottom:16px"><option value="cash">Tiền mặt</option><option value="transfer">Chuyển khoản</option><option value="card">Thẻ</option></select>');
          if (isUpdate && existingPayment) methodSel.val(existingPayment.payment_method);
          form.append(methodSel);

          // Note
          form.append('<label style="display:block;margin-bottom:8px;font-weight:600">Ghi chú</label>');
          const noteInput = $('<textarea id="pay_note" rows="3" style="width:100%;margin-bottom:20px" placeholder="Nhập ghi chú nếu có..."></textarea>');
          if (isUpdate && existingPayment) noteInput.val(existingPayment.note || '');
          form.append(noteInput);

          // Buttons
          const btnGroup = $('<div style="display:flex;gap:10px;justify-content:flex-end"></div>');
          const cancelBtn = $('<button class="btn">Hủy</button>').on('click', () => {
            this.load(); // Reload to show list
          });
          const confirmBtn = $(`<button class="btn primary">${btnLabel}</button>`).on('click', async () => {
            const method = $('#pay_method').val();
            const note = $('#pay_note').val();

            try {
              if (isUpdate) {
                await api.payments.patch(existingPayment.id, {
                  payment_method: method,
                  note: note,
                  status: 'completed' // ensure it's marked completed
                });
                showToast('Cập nhật thanh toán thành công!', 'success');
              } else {
                await api.payments.create({
                  reservation_id: res.id,
                  amount_cents: res.price_cents,
                  payment_method: method,
                  payment_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
                  status: 'completed',
                  source_type: 'reservation',
                  note: note
                });
                showToast('Thanh toán thành công!', 'success');
              }
              this.load(); // Return to list view
            } catch (err) {
              showToast(err.responseJSON ? err.responseJSON.error : err.statusText, 'error');
            }
          });

          btnGroup.append(cancelBtn, confirmBtn);
          formCard.append(form, btnGroup);

          container.empty().append(formCard);
          return;
        }

        // Default View: List of Payments
        const data = await api.payments.list();
        const dedup = [];
        data.forEach(row => {
          if (!dedup.some(item => item.id === row.id)) dedup.push(row);
        });
        this.data = dedup;

        const toolbar = $('<div class="toolbar"></div>');
        const refreshBtn = $('<button class="btn">Tải lại</button>').on('click', () => this.load());
        // Add manual payment button (generic)
        const addBtn = $('<button class="btn primary">Tạo thanh toán</button>').on('click', () => {
          openDrawer('Tạo thanh toán', null, 'payments');
        });

        toolbar.append(refreshBtn, addBtn);
        const tableContainer = $('<div></div>');

        // Enrich data with reservation info if possible (would need join or lookup, for now just raw data)
        renderTable(tableContainer,
          [
            { key: 'id', label: 'ID' },
            { key: 'reservation_id', label: 'Ref ID' },
            { key: 'amount_cents', label: 'Số tiền' },
            { key: 'payment_method', label: 'Phương thức' },
            { key: 'payment_date', label: 'Ngày' },
            { key: 'status', label: 'Trạng thái' }
          ],
          data,
          { actions: true, onEdit: true, onDelete: true }
        );

        tableContainer.on('click', 'button[data-action]', async (e) => {
          const id = parseInt($(e.target).closest('tr').data('id'), 10);
          const row = this.data.find(r => r.id === id);
          const action = $(e.target).data('action');
          if (action === 'edit') {
            const rcopy = { ...row };
            rcopy.payment_date = row.payment_date ? row.payment_date.replace(' ', 'T') : '';
            openDrawer('Sửa thanh toán', rcopy, 'payments');
          } else if (action === 'delete') {
            if (confirm('Xoá?')) {
              api.payments.remove(id).then(() => this.load());
            }
          }
        });

        container.empty().append($('<div class="card"></div>').append(toolbar, tableContainer));
      },
      create: (d) => api.payments.create({
        reservation_id: d.reservation_id ? parseInt(d.reservation_id, 10) : null,
        amount_cents: parseInt(d.amount_cents || '0', 10),
        payment_method: d.payment_method,
        payment_date: d.payment_date ? d.payment_date.replace('T', ' ') : null,
        status: d.status,
        source_type: 'manual' // Default for manual creation
      }),
      patch: (id, d) => {
        if (d.payment_date) d.payment_date = d.payment_date.replace('T', ' ');
        return api.payments.patch(id, d);
      },
      remove: (id) => api.payments.remove(id)
    },
    notifications: {
      fields: [
        { key: 'type', label: 'Loại', type: 'select', options: [{ value: 'email', text: 'Email' }, { value: 'sms', text: 'SMS' }, { value: 'push', text: 'Push' }] },
        { key: 'recipient', label: 'Người nhận', type: 'text' },
        { key: 'subject', label: 'Tiêu đề', type: 'text' },
        { key: 'message', label: 'Nội dung', type: 'textarea' },
        { key: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'pending', text: 'Chờ gửi' }, { value: 'sent', text: 'Đã gửi' }, { value: 'failed', text: 'Lỗi' }] }
      ],
      load: async function () {
        const data = await api.notifications.list();
        const dedup = [];
        data.forEach(row => {
          if (!dedup.some(item => item.id === row.id)) dedup.push(row);
        });
        this.data = dedup;
        const container = $('#section-notifications');

        // Tabs for Notifications vs Messages
        const subNav = $('<div class="flex gap-4 mb-4 border-b border-slate-700 pb-2"></div>');
        const notifTab = $('<button class="text-emerald-400 font-bold border-b-2 border-emerald-400 pb-1">Thông báo hệ thống</button>');
        const msgTab = $('<button class="text-slate-400 font-medium pb-1 hover:text-emerald-300 transition-colors">Tin nhắn thành viên</button>');

        msgTab.on('click', () => {
          // Switch to messages view
          this.loadMessages(container);
        });

        subNav.append(notifTab, msgTab);

        const toolbar = $('<div class="toolbar"></div>');
        const refreshBtn = $('<button class="btn">Tải lại</button>').on('click', () => this.load());
        const addBtn = $('<button class="btn primary">Tạo thông báo</button>').on('click', () => {
          openDrawer('Tạo thông báo', null, 'notifications');
        });
        toolbar.append(refreshBtn, addBtn);
        const tableContainer = $('<div></div>');
        renderTable(tableContainer,
          [
            { key: 'type', label: 'Loại' },
            { key: 'recipient', label: 'Người nhận' },
            { key: 'subject', label: 'Tiêu đề' },
            { key: 'status', label: 'Trạng thái' },
            { key: 'created_at', label: 'Tạo lúc' }
          ],
          data,
          { actions: true, onEdit: true, onDelete: true }
        );
        tableContainer.on('click', 'button[data-action]', async (e) => {
          const id = parseInt($(e.target).closest('tr').data('id'), 10);
          const row = this.data.find(r => r.id === id);
          const action = $(e.target).data('action');
          if (action === 'edit') {
            openDrawer('Sửa thông báo', row, 'notifications');
          } else if (action === 'delete') {
            if (confirm('Xoá?')) {
              api.notifications.remove(id).then(() => this.load());
            }
          }
        });
        container.empty().append($('<div class="card"></div>').append(subNav, toolbar, tableContainer));
      },
      loadMessages: async function (container) {
        const data = await api.messages.list();
        const dedup = [];
        data.forEach(row => {
          if (!dedup.some(item => item.id === row.id)) dedup.push(row);
        });

        const subNav = $('<div class="flex gap-4 mb-4 border-b border-slate-700 pb-2"></div>');
        const notifTab = $('<button class="text-slate-400 font-medium pb-1 hover:text-emerald-300 transition-colors">Thông báo hệ thống</button>');
        const msgTab = $('<button class="text-emerald-400 font-bold border-b-2 border-emerald-400 pb-1">Tin nhắn thành viên</button>');

        notifTab.on('click', () => {
          this.load(); // Switch back to notifications
        });

        subNav.append(notifTab, msgTab);

        const toolbar = $('<div class="toolbar"></div>');
        const refreshBtn = $('<button class="btn">Tải lại</button>').on('click', () => this.loadMessages(container));
        toolbar.append(refreshBtn);

        const tableContainer = $('<div></div>');
        renderTable(tableContainer,
          [
            { key: 'sender_name', label: 'Người gửi' },
            { key: 'receiver_name', label: 'Người nhận' },
            { key: 'message', label: 'Nội dung' },
            { key: 'is_read', label: 'Đã xem' },
            { key: 'created_at', label: 'Thời gian' }
          ],
          data,
          { actions: false } // Read-only for now
        );

        container.empty().append($('<div class="card"></div>').append(subNav, toolbar, tableContainer));
      },
      create: (d) => api.notifications.create(d),
      patch: (id, d) => api.notifications.patch(id, d),
      remove: (id) => api.notifications.remove(id)
    }
  };

  // Navigation handling
  $('.nav-tab').on('click', function () {
    $('.nav-tab').removeClass('active');
    $(this).addClass('active');
    const section = $(this).data('section');
    $('.section').hide();
    $('#section-' + section).fadeIn(200);
    // Load data for the section
    if (modules[section] && modules[section].load) {
      modules[section].load();
    }
    // Show/Hide right panel schedule
    if (section === 'reservations') {
      $('#right-panel').show();
      loadSchedule();
    } else {
      if ($(window).width() < 960) {
        $('#right-panel').hide();
      }
    }
  });

  // Right panel schedule loader
  async function loadSchedule() {
    const container = $('#schedule-container');
    container.html('<div class="spinner"></div>');
    try {
      const reservations = await api.reservations.list();
      const events = await api.events.list();
      const courts = await api.courts.list();

      // Filter for next 7 days
      const now = new Date();
      const next7 = new Date();
      next7.setDate(now.getDate() + 7);

      const upcoming = reservations.filter(r => {
        const d = new Date(r.start_time.replace(' ', 'T'));
        return d >= now && d <= next7;
      }).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

      if (upcoming.length === 0) {
        container.html('<p style="color:var(--muted)">Không có đặt sân sắp tới.</p>');
        return;
      }

      let html = '<ul style="display:block;list-style:none;padding:0">';
      upcoming.slice(0, 10).forEach(r => {
        const d = new Date(r.start_time.replace(' ', 'T'));
        const dateStr = d.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' });
        const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        html += `
                <li style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--border)">
                  <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                    <span style="font-weight:600;color:white">${dateStr} ${timeStr}</span>
                    <span class="badge ${r.status}">${r.status}</span>
                  </div>
                  <div style="font-size:0.9em;color:var(--muted)">
                    ${r.court_name} - ${r.player_name}
                  </div>
                </li>
              `;
      });
      html += '</ul>';
      container.html(html);
    } catch (e) {
      container.html('<p style="color:var(--danger)">Lỗi tải lịch.</p>');
    }
  }

  // Initial load
  $(document).ready(() => {
    // Default to players
    $('button[data-section="players"]').click();
  });

})();
