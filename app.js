(function () {
  const STORAGE_KEY = "school-saas-admin-state-v1";
  const COURSE_CATEGORIES = [
    "图像记忆法",
    "思维导图记忆法",
    "记忆宫殿法",
    "大脑潜能训练",
    "思维能力训练"
  ];

  const roles = {
    admin: {
      name: "管理员",
      user: "周校长",
      initial: "A",
      hint: "可管理账号、权限、全部教学数据。",
      permissions: ["materials", "students", "classes", "courses", "scores", "reports"]
    },
    teacher: {
      name: "老师",
      user: "林老师",
      initial: "T",
      hint: "聚焦日常上课、反馈、成绩和课件使用。",
      permissions: ["materials", "students", "classes", "courses", "scores", "reports"]
    },
    student: {
      name: "学生",
      user: "学生账号",
      initial: "S",
      hint: "查看课件、课程和阶段报告。",
      permissions: ["materials", "courses", "reports"]
    },
    parent: {
      name: "家长",
      user: "家长账号",
      initial: "P",
      hint: "查看学生课程、成绩和阶段报告。",
      permissions: ["courses", "scores", "reports"]
    }
  };

  const modules = [
    { id: "materials", label: "课件知识库" },
    { id: "students", label: "学生管理" },
    { id: "classes", label: "班级管理" },
    { id: "courses", label: "课程管理" },
    { id: "scores", label: "成绩与评分" },
    { id: "reports", label: "阶段报告" }
  ];

  const defaultState = {
    role: "teacher",
    activeModule: "materials",
    sidebarCollapsed: false,
    accounts: [
      { id: uid(), name: "周校长", role: "admin", phone: "13800000001", status: "启用" },
      { id: uid(), name: "林老师", role: "teacher", phone: "13800000002", status: "启用" },
      { id: uid(), name: "学生账号", role: "student", phone: "13800000003", status: "启用" },
      { id: uid(), name: "家长账号", role: "parent", phone: "13800000004", status: "启用" }
    ],
    students: [
      { id: uid(), name: "王一诺", grade: "五年级", guardian: "王女士", phone: "13900000001", status: "在读" },
      { id: uid(), name: "李思远", grade: "六年级", guardian: "李先生", phone: "13900000002", status: "在读" }
    ],
    classes: [
      { id: uid(), name: "五年级英语提升 A 班", grade: "五年级", teacher: "林老师", schedule: "周六 10:00", capacity: 12 },
      { id: uid(), name: "六年级阅读写作 B 班", grade: "六年级", teacher: "林老师", schedule: "周日 14:00", capacity: 10 }
    ],
    courses: [
      { id: uid(), name: "古诗图像记忆", grade: "五年级", category: "图像记忆法", teacher: "林老师", hours: 16 },
      { id: uid(), name: "知识网络构建", grade: "六年级", category: "思维导图记忆法", teacher: "林老师", hours: 12 }
    ],
    materials: [
      { id: uid(), title: "图像记忆法第 1 讲", grade: "五年级", category: "图像记忆法", year: "2026", fileName: "image-memory-lesson-1.pdf", source: "seed", notes: "可作为后续知识库 ground truth。" }
    ],
    feedback: [
      { id: uid(), date: "2026-06-22", student: "王一诺", course: "英语阅读理解", attendance: "到课", focus: 4, participation: 5, homework: 4, comment: "课堂互动积极，主旨题稳定，细节定位还需要练习。" }
    ],
    scores: [
      { id: uid(), date: "2026-06-20", student: "王一诺", course: "英语阅读理解", exam: "阶段测 1", score: 86, understanding: 4, expression: 5, discipline: 4, homeworkQuality: 4 }
    ],
    reports: []
  };

  let state = loadState();

  const els = {
    nav: document.getElementById("nav"),
    content: document.getElementById("content"),
    title: document.getElementById("pageTitle"),
    roleSelect: document.getElementById("roleSelect"),
    roleHint: document.getElementById("roleHint"),
    userInitial: document.getElementById("userInitial"),
    userName: document.getElementById("userName"),
    userRoleName: document.getElementById("userRoleName"),
    appShell: document.getElementById("appShell"),
    sidebarToggle: document.getElementById("sidebarToggle")
  };

  init();

  function init() {
    normalizeState();
    renderRoleSelect();
    bindSidebarToggle();
    renderChrome();
    render();
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return saved ? { ...defaultState, ...saved } : defaultState;
    } catch (error) {
      return defaultState;
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function normalizeState() {
    if (state.role === "assistant") state.role = "teacher";
    if (!roles[state.role]) state.role = "teacher";
    state.sidebarCollapsed = Boolean(state.sidebarCollapsed);
    const allowed = roles[state.role].permissions;
    const moduleExists = modules.some((item) => item.id === state.activeModule);
    if (!moduleExists || !allowed.includes(state.activeModule)) {
      state.activeModule = allowed[0];
    }
    state.courses = state.courses.map((item) => ({
      ...item,
      category: COURSE_CATEGORIES.includes(item.category) ? item.category : COURSE_CATEGORIES[0]
    }));
    state.materials = state.materials.map((item) => ({
      ...item,
      category: COURSE_CATEGORIES.includes(item.category) ? item.category : COURSE_CATEGORIES[0]
    }));
    saveState();
  }

  function uid() {
    return Math.random().toString(36).slice(2, 10);
  }

  function renderRoleSelect() {
    els.roleSelect.innerHTML = Object.entries(roles)
      .map(([id, role]) => `<option value="${id}">${role.name}</option>`)
      .join("");
    els.roleSelect.value = state.role;
    els.roleSelect.addEventListener("change", () => {
      state.role = els.roleSelect.value;
      const allowed = roles[state.role].permissions;
      if (!allowed.includes(state.activeModule)) state.activeModule = allowed[0];
      saveState();
      renderChrome();
      render();
    });
  }

  function renderChrome() {
    const role = roles[state.role];
    els.roleHint.textContent = role.hint;
    els.userInitial.textContent = role.initial;
    els.userName.textContent = role.user;
    els.userRoleName.textContent = role.name;
    els.appShell.classList.toggle("sidebar-collapsed", state.sidebarCollapsed);
    els.sidebarToggle.textContent = state.sidebarCollapsed ? "▶" : "◀";
    els.sidebarToggle.title = state.sidebarCollapsed ? "展开侧栏" : "收起侧栏";
    els.sidebarToggle.setAttribute("aria-label", els.sidebarToggle.title);
    els.sidebarToggle.setAttribute("aria-expanded", String(!state.sidebarCollapsed));

    els.nav.innerHTML = modules
      .filter((item) => role.permissions.includes(item.id))
      .map((item) => {
        const active = item.id === state.activeModule ? "active" : "";
        return `<button class="${active}" data-module="${item.id}"><span>${item.label}</span></button>`;
      })
      .join("");

    els.nav.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeModule = button.dataset.module;
        saveState();
        renderChrome();
        render();
      });
    });
  }

  function bindSidebarToggle() {
    els.sidebarToggle.addEventListener("click", () => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      saveState();
      renderChrome();
    });
  }

  function render() {
    const module = modules.find((item) => item.id === state.activeModule) || modules[0];
    els.title.textContent = module.label;
    const renderers = {
      dashboard: renderDashboard,
      accounts: renderAccounts,
      students: renderStudents,
      classes: renderClasses,
      courses: renderCourses,
      materials: renderMaterials,
      feedback: renderFeedback,
      scores: renderScores,
      reports: renderReports,
      roadmap: renderRoadmap
    };
    els.content.innerHTML = "";
    renderers[state.activeModule]();
  }

  function renderDashboard() {
    els.content.innerHTML = `
      <section class="teacher-hero">
        <div>
          <p class="eyebrow">教师端</p>
          <h2>今天从哪里开始？</h2>
          <p>常用工作先收在两个入口里：备课找资料走课件知识库，课后跟进学生走学生管理平台。</p>
        </div>
        <div class="hero-stats">
          ${metric("课件", state.materials.length, "已分类资源")}
          ${metric("学生", state.students.length, "当前在读学生")}
        </div>
      </section>

      <section class="entry-grid">
        <button class="entry-panel knowledge" data-go="materials">
          <span class="entry-icon">KB</span>
          <strong>课件知识库</strong>
          <small>上传、分类、搜索和下载课件，后续接入文档解析与 RAG 问答。</small>
          <em>进入知识库</em>
        </button>
        <button class="entry-panel student-platform" data-go="students">
          <span class="entry-icon">ST</span>
          <strong>学生管理平台</strong>
          <small>管理学生、班级、课程，记录课堂反馈、成绩和阶段报告。</small>
          <em>进入学生管理</em>
        </button>
      </section>

      <section class="dashboard-grid">
        ${metric("班级", state.classes.length, "可排课班级")}
        ${metric("课程", state.courses.length, "已开设课程")}
        ${metric("课堂反馈", state.feedback.length, "已记录课次")}
        ${metric("阶段报告", state.reports.length, "已生成初稿")}
      </section>
      <section class="band">
        <h2>老师每日流程</h2>
        <div class="timeline">
          <div class="timeline-item"><strong>课前</strong><span>查班级、查课程、下载课件。</span></div>
          <div class="timeline-item"><strong>课中/课后</strong><span>记录到课、课堂表现、作业情况和老师评语。</span></div>
          <div class="timeline-item"><strong>阶段复盘</strong><span>录入测验成绩和多维评分，生成阶段报告初稿。</span></div>
        </div>
      </section>
    `;
    bindEntryButtons();
  }

  function bindEntryButtons() {
    document.querySelectorAll("[data-go]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeModule = button.dataset.go;
        saveAndRender();
      });
    });
  }

  function metric(label, value, caption) {
    return `<div class="metric"><span>${label}</span><strong>${value}</strong><small>${caption}</small></div>`;
  }

  function renderAccounts() {
    if (!can("accounts")) return renderLocked();
    els.content.innerHTML = `
      <section class="split">
        ${formPanel("新增账号", [
          input("name", "姓名"),
          select("role", "角色", roleOptions()),
          input("phone", "手机号"),
          select("status", "状态", ["启用", "停用"])
        ], "addAccount")}
        ${tablePanel("账号列表", ["姓名", "角色", "手机号", "状态"], state.accounts.map((item) => [
          item.name,
          roles[item.role]?.name || item.role,
          item.phone,
          tag(item.status, item.status === "启用" ? "good" : "warn")
        ]))}
      </section>
    `;
    bindForm("addAccount", (data) => {
      state.accounts.unshift({ id: uid(), ...data });
      saveAndRender();
    });
  }

  function renderStudents() {
    els.content.innerHTML = `
      <section class="split">
        ${formPanel("新增学生", [
          input("name", "学生姓名"),
          select("grade", "年级", grades()),
          input("guardian", "家长姓名"),
          input("phone", "联系电话"),
          select("status", "状态", ["在读", "停课", "结课"])
        ], "addStudent")}
        ${tablePanel("学生档案", ["姓名", "年级", "家长", "电话", "状态"], state.students.map((item) => [
          item.name,
          item.grade,
          item.guardian,
          item.phone,
          tag(item.status, item.status === "在读" ? "good" : "warn")
        ]))}
      </section>
    `;
    bindForm("addStudent", (data) => {
      state.students.unshift({ id: uid(), ...data });
      saveAndRender();
    });
  }

  function renderClasses() {
    els.content.innerHTML = `
      <section class="split">
        ${formPanel("新增班级", [
          input("name", "班级名称"),
          select("grade", "年级", grades()),
          input("teacher", "授课老师"),
          input("schedule", "上课时间"),
          input("capacity", "班额", "number")
        ], "addClass")}
        ${tablePanel("班级列表", ["班级", "年级", "老师", "时间", "班额"], state.classes.map((item) => [
          item.name,
          item.grade,
          item.teacher,
          item.schedule,
          item.capacity
        ]))}
      </section>
    `;
    bindForm("addClass", (data) => {
      state.classes.unshift({ id: uid(), ...data });
      saveAndRender();
    });
  }

  function renderCourses() {
    els.content.innerHTML = `
      <section class="split">
        ${formPanel("新增课程", [
          input("name", "课程名称"),
          select("grade", "年级", grades()),
          select("category", "科目分类", categories()),
          input("teacher", "负责老师"),
          input("hours", "总课时", "number")
        ], "addCourse")}
        ${tablePanel("课程列表", ["课程", "年级", "分类", "老师", "课时"], state.courses.map((item) => [
          item.name,
          item.grade,
          tag(item.category),
          item.teacher,
          item.hours
        ]))}
      </section>
    `;
    bindForm("addCourse", (data) => {
      state.courses.unshift({ id: uid(), ...data });
      saveAndRender();
    });
  }

  function renderMaterials() {
    const canManageMaterials = ["admin", "teacher"].includes(state.role);
    els.content.innerHTML = `
      <section class="${canManageMaterials ? "split" : ""}">
        ${canManageMaterials ? `<form id="addMaterial" class="form-panel">
          <h2>上传课件</h2>
          <div class="form-grid">
            ${input("title", "课件名称")}
            ${select("grade", "年级", grades())}
            ${select("category", "分类", categories())}
            ${input("year", "年份", "number", "2026")}
            <div class="field full">
              <label for="materialFile">文件</label>
              <input id="materialFile" name="file" type="file" />
              <span class="field-hint">当前 MVP 记录文件名和下载模拟；后续替换为 OSS/S3 云存储。</span>
            </div>
            ${textarea("notes", "课件说明")}
          </div>
          <div class="actions"><button class="primary" type="submit">保存课件</button></div>
        </form>` : ""}
        <div class="table-wrap">
          <div class="band">
            <h2>课件库</h2>
            <div class="toolbar">
              <input id="materialSearch" placeholder="搜索课件、年级、分类" />
              <select id="materialFilter">${["全部", ...categories()].map((v) => `<option>${v}</option>`).join("")}</select>
            </div>
          </div>
          <table>
            <thead><tr><th>课件</th><th>年级/分类</th><th>年份</th><th>操作</th></tr></thead>
            <tbody id="materialsBody"></tbody>
          </table>
        </div>
      </section>
    `;
    if (canManageMaterials) {
      bindForm("addMaterial", (data, form) => {
        const file = form.querySelector("input[type=file]").files[0];
        state.materials.unshift({ id: uid(), ...data, fileName: file ? file.name : "未选择文件", source: "local" });
        saveAndRender();
      });
    }
    const renderRows = () => {
      const query = document.getElementById("materialSearch").value.trim().toLowerCase();
      const filter = document.getElementById("materialFilter").value;
      const rows = state.materials.filter((item) => {
        const haystack = `${item.title} ${item.grade} ${item.category}`.toLowerCase();
        return haystack.includes(query) && (filter === "全部" || item.category === filter);
      });
      document.getElementById("materialsBody").innerHTML = rows.length ? rows.map((item) => `
        <tr>
          <td><strong>${item.title}</strong><br><small>${item.fileName}</small></td>
          <td><div class="tag-list">${tag(item.grade, "good")}${tag(item.category)}</div></td>
          <td>${item.year}</td>
          <td>
            <div class="row-actions">
              <button class="secondary" data-download="${item.id}">下载</button>
              ${canManageMaterials ? `<button class="danger" data-delete-material="${item.id}">删除</button>` : ""}
            </div>
          </td>
        </tr>
      `).join("") : emptyRow(4);
      document.querySelectorAll("[data-download]").forEach((button) => {
        button.addEventListener("click", () => downloadMaterial(button.dataset.download));
      });
      document.querySelectorAll("[data-delete-material]").forEach((button) => {
        button.addEventListener("click", () => deleteMaterial(button.dataset.deleteMaterial));
      });
    };
    document.getElementById("materialSearch").addEventListener("input", renderRows);
    document.getElementById("materialFilter").addEventListener("change", renderRows);
    renderRows();
  }

  function renderFeedback() {
    els.content.innerHTML = `
      <section class="split">
        ${formPanel("记录课堂反馈", [
          input("date", "上课日期", "date", today()),
          select("student", "学生", state.students.map((item) => item.name)),
          select("course", "课程", state.courses.map((item) => item.name)),
          select("attendance", "出勤", ["到课", "请假", "缺勤"]),
          select("focus", "专注度", scoreOptions()),
          select("participation", "参与度", scoreOptions()),
          select("homework", "作业完成", scoreOptions()),
          textarea("comment", "老师评语")
        ], "addFeedback")}
        ${tablePanel("课堂反馈记录", ["日期", "学生", "课程", "表现", "评语"], state.feedback.map((item) => [
          item.date,
          item.student,
          item.course,
          `专注 ${item.focus} / 参与 ${item.participation} / 作业 ${item.homework}`,
          item.comment
        ]))}
      </section>
    `;
    bindForm("addFeedback", (data) => {
      state.feedback.unshift({ id: uid(), ...data });
      saveAndRender();
    });
  }

  function renderScores() {
    els.content.innerHTML = `
      <section class="split">
        ${formPanel("录入成绩与评分", [
          input("date", "考试日期", "date", today()),
          select("student", "学生", state.students.map((item) => item.name)),
          select("course", "课程", state.courses.map((item) => item.name)),
          input("exam", "测评名称"),
          input("score", "分数", "number"),
          select("understanding", "理解能力", scoreOptions()),
          select("expression", "表达能力", scoreOptions()),
          select("discipline", "学习习惯", scoreOptions()),
          select("homeworkQuality", "作业质量", scoreOptions())
        ], "addScore")}
        ${tablePanel("成绩与多维评分", ["日期", "学生", "测评", "分数", "维度评分"], state.scores.map((item) => [
          item.date,
          item.student,
          item.exam,
          item.score,
          `理解 ${item.understanding} / 表达 ${item.expression} / 习惯 ${item.discipline} / 作业 ${item.homeworkQuality}`
        ]))}
      </section>
    `;
    bindForm("addScore", (data) => {
      state.scores.unshift({ id: uid(), ...data });
      saveAndRender();
    });
  }

  function renderReports() {
    const selected = state.students[0]?.name || "";
    els.content.innerHTML = `
      <section class="split">
        <form id="generateReport" class="form-panel">
          <h2>生成阶段报告</h2>
          <div class="form-grid">
            ${select("student", "学生", state.students.map((item) => item.name), selected)}
            ${input("period", "阶段", "text", "2026 春季期末")}
            ${textarea("teacherNote", "老师补充意见")}
          </div>
          <div class="actions">
            <button class="secondary" type="button" id="exportReport">导出 PDF 模板</button>
            <button class="primary" type="submit">生成报告初稿</button>
          </div>
        </form>
        <div class="report-preview" id="reportPreview">
          ${latestReportHtml()}
        </div>
      </section>
      <section class="band">
        <h2>AI 接入边界</h2>
        <p class="muted">当前先用结构化数据生成稳定初稿。接入真实 AI 时，把成绩统计、课堂反馈摘要、老师补充意见作为输入，由老师审核后再导出 PDF。</p>
      </section>
    `;
    bindForm("generateReport", (data) => {
      const report = buildReport(data.student, data.period, data.teacherNote);
      state.reports.unshift(report);
      saveAndRender();
    });
    document.getElementById("exportReport").addEventListener("click", () => window.print());
  }

  function latestReportHtml() {
    if (!state.reports.length) {
      return `<strong>报告预览</strong><span class="muted">选择学生并生成报告后，这里会出现可审核的报告初稿。</span>`;
    }
    const report = state.reports[0];
    return `
      <h2>${report.title}</h2>
      <p><strong>学生：</strong>${report.student}</p>
      <p><strong>综合表现：</strong>${report.summary}</p>
      <p><strong>优势：</strong>${report.strengths}</p>
      <p><strong>改进建议：</strong>${report.suggestions}</p>
      <p><strong>老师补充：</strong>${report.teacherNote || "暂无"}</p>
    `;
  }

  function buildReport(student, period, teacherNote) {
    const feedback = state.feedback.filter((item) => item.student === student);
    const scores = state.scores.filter((item) => item.student === student);
    const avgScore = average(scores.map((item) => Number(item.score)));
    const avgFocus = average(feedback.map((item) => Number(item.focus)));
    const avgParticipation = average(feedback.map((item) => Number(item.participation)));
    return {
      id: uid(),
      student,
      title: `${period} 学习阶段报告`,
      summary: `${student} 本阶段累计课堂反馈 ${feedback.length} 次，成绩记录 ${scores.length} 次，平均分 ${avgScore || "暂无"}。课堂专注度均值 ${avgFocus || "暂无"}，参与度均值 ${avgParticipation || "暂无"}。`,
      strengths: avgParticipation >= 4 ? "课堂参与积极，愿意表达思路。" : "已形成基本课堂节奏，后续可继续提升主动表达。",
      suggestions: avgScore >= 85 ? "建议增加综合应用题训练，保持优势并拓展难度。" : "建议针对薄弱知识点安排错题复盘和短周期测评。",
      teacherNote
    };
  }

  function renderRoadmap() {
    els.content.innerHTML = `
      <section class="band">
        <h2>按优先级推进</h2>
        <div class="timeline">
          <div class="timeline-item"><strong>1. 后台管理系统</strong><span>当前原型已覆盖账号、角色、学生、班级、课程、课件、反馈、成绩和报告。</span></div>
          <div class="timeline-item"><strong>2. 真实服务端</strong><span>接入 PostgreSQL、文件云存储、登录鉴权和权限中间件。</span></div>
          <div class="timeline-item"><strong>3. AI 阶段报告</strong><span>先做结构化统计 + 大模型润色，由老师审核。</span></div>
          <div class="timeline-item"><strong>4. 文档解析与 RAG</strong><span>课件解析、分块、向量检索、来源引用，放在老师流程稳定之后。</span></div>
          <div class="timeline-item"><strong>5. PDF 与家长端</strong><span>确定报告模板后再做 PDF 导出和家长/学生端只读入口。</span></div>
        </div>
      </section>
    `;
  }

  function renderLocked() {
    els.content.innerHTML = `<section class="band locked"><div><h2>当前角色无权限</h2><p class="muted">请切换为管理员查看该模块。</p></div></section>`;
  }

  function can(moduleId) {
    return roles[state.role].permissions.includes(moduleId);
  }

  function formPanel(title, fields, id) {
    return `
      <form id="${id}" class="form-panel">
        <h2>${title}</h2>
        <div class="form-grid">${fields.join("")}</div>
        <div class="actions"><button class="primary" type="submit">保存</button></div>
      </form>
    `;
  }

  function input(name, label, type = "text", value = "") {
    return `<div class="field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${value}" required /></div>`;
  }

  function textarea(name, label) {
    return `<div class="field full"><label for="${name}">${label}</label><textarea id="${name}" name="${name}"></textarea></div>`;
  }

  function select(name, label, options, selected = "") {
    const safeOptions = options.length ? options : ["暂无可选项"];
    return `
      <div class="field">
        <label for="${name}">${label}</label>
        <select id="${name}" name="${name}">
          ${safeOptions.map((option) => {
            const value = typeof option === "object" ? option.value : option;
            const text = typeof option === "object" ? option.label : option;
            return `<option value="${value}" ${value === selected ? "selected" : ""}>${text}</option>`;
          }).join("")}
        </select>
      </div>
    `;
  }

  function tablePanel(title, headers, rows) {
    return `
      <div class="table-wrap">
        <div class="band"><h2>${title}</h2></div>
        <table>
          <thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead>
          <tbody>${rows.length ? rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("") : emptyRow(headers.length)}</tbody>
        </table>
      </div>
    `;
  }

  function bindForm(id, handler) {
    const form = document.getElementById(id);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      handler(data, form);
    });
  }

  function saveAndRender() {
    saveState();
    renderChrome();
    render();
  }

  function roleOptions() {
    return Object.entries(roles).map(([value, role]) => ({ value, label: role.name }));
  }

  function grades() {
    return ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级", "初一", "初二", "初三", "高一", "高二", "高三"];
  }

  function categories() {
    return COURSE_CATEGORIES;
  }

  function scoreOptions() {
    return ["1", "2", "3", "4", "5"];
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function tag(text, tone = "") {
    return `<span class="tag ${tone}">${text}</span>`;
  }

  function emptyRow(colspan) {
    return `<tr><td colspan="${colspan}"><div class="empty-state"><strong>暂无数据</strong><span>保存表单后会显示在这里。</span></div></td></tr>`;
  }

  function average(values) {
    const clean = values.filter((value) => Number.isFinite(value) && value > 0);
    if (!clean.length) return 0;
    return Math.round((clean.reduce((sum, value) => sum + value, 0) / clean.length) * 10) / 10;
  }

  function downloadMaterial(id) {
    const item = state.materials.find((material) => material.id === id);
    const content = `课件下载模拟\n名称：${item.title}\n文件：${item.fileName}\n年级：${item.grade}\n分类：${item.category}\n说明：${item.notes || ""}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${item.title}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function deleteMaterial(id) {
    if (!["admin", "teacher"].includes(state.role)) return;
    const item = state.materials.find((material) => material.id === id);
    if (!item || !window.confirm(`确定删除课件“${item.title}”吗？`)) return;
    state.materials = state.materials.filter((material) => material.id !== id);
    saveAndRender();
  }
})();
