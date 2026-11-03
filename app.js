// 스마트 머니로그 (Smart MoneyLog) 핵심 비즈니스 로직
const STORAGE_KEY = 'smart_moneylog_data';
const BUDGET_KEY = 'smart_moneylog_budget';

// 카테고리 정의
const CATEGORIES = {
  expense: [
    { name: "식비", color: "#f97316" },
    { name: "주거/통신", color: "#3b82f6" },
    { name: "교통", color: "#eab308" },
    { name: "쇼핑", color: "#ec4899" },
    { name: "문화/여가", color: "#8b5cf6" },
    { name: "의료/건강", color: "#14b8a6" },
    { name: "기타", color: "#64748b" }
  ],
  income: [
    { name: "급여", color: "#10b981" },
    { name: "부수입", color: "#06b6d4" },
    { name: "금융소득", color: "#6366f1" },
    { name: "기타", color: "#64748b" }
  ]
};

// 기본 샘플 데이터 (IBK 직장인 현실 데이터)
const SAMPLE_TRANSACTIONS = [
  { id: "tx_01", date: "2026-11-01", type: "income", category: "급여", title: "10월 급여 입금 (IBK)", amount: 3850000, memo: "본봉 및 수당" },
  { id: "tx_02", date: "2026-11-01", type: "expense", category: "주거/통신", title: "아파트 관리비 자동이체", amount: 240000, memo: "관리비 및 전기세" },
  { id: "tx_03", date: "2026-11-01", type: "expense", category: "식비", title: "주말 마트 장보기 (이마트)", amount: 128500, memo: "식재료 및 생필품" },
  { id: "tx_04", date: "2026-11-02", type: "expense", category: "식비", title: "구내식당 식권 충전", amount: 65000, memo: "10회권" },
  { id: "tx_05", date: "2026-11-02", type: "expense", category: "교통", title: "지하철 정기권 충전", amount: 65000, memo: "출퇴근 대중교통" },
  { id: "tx_06", date: "2026-11-02", type: "expense", category: "문화/여가", title: "온라인 서적 구매", amount: 32000, memo: "바이브코딩 업무 서적" },
  { id: "tx_07", date: "2026-11-03", type: "income", category: "금융소득", title: "정기예금 만기 이자 입금", amount: 154000, memo: "세후 수령액" },
  { id: "tx_08", date: "2026-11-03", type: "expense", category: "식비", title: "스타벅스 커피", amount: 6000, memo: "모닝 아메리카노" },
  { id: "tx_09", date: "2026-11-03", type: "expense", category: "쇼핑", title: "유니클로 가을 니트", amount: 49900, memo: "출근 복장" }
];

// 상태 변수
let transactions = [];
let monthlyBudget = 2000000; // 기본 월 200만원 예산
let currentYear = 2026;
let currentMonth = 11; // 1-12
let currentType = 'expense';
let currentFilter = 'all'; // all, expense, income
let currentSort = 'date_desc';
let searchKeyword = '';

document.addEventListener('DOMContentLoaded', () => {
  loadStorage();
  initDateControls();
  initFormControls();
  initFilterControls();
  initBackupControls();
  render();
});

// 데이터 로드
function loadStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      transactions = JSON.parse(saved);
    } catch(e) {
      transactions = [];
    }
  } else {
    // 최초 방문 시 샘플 데이터로 초기화
    transactions = [...SAMPLE_TRANSACTIONS];
    saveStorage();
  }

  const savedBudget = localStorage.getItem(BUDGET_KEY);
  if (savedBudget) {
    monthlyBudget = parseInt(savedBudget, 10) || 2000000;
  }
}

function saveStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

// 월 컨트롤 초기화
function initDateControls() {
  document.getElementById('prevMonthBtn').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 1) { currentMonth = 12; currentYear--; }
    render();
  });

  document.getElementById('nextMonthBtn').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 12) { currentMonth = 1; currentYear++; }
    render();
  });

  document.getElementById('todayMonthBtn').addEventListener('click', () => {
    const now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth() + 1;
    render();
  });
}

// 폼 컨트롤 초기화
function initFormControls() {
  const dateInput = document.getElementById('txDate');
  dateInput.value = new Date().toISOString().split('T')[0];

  const expenseBtn = document.getElementById('typeExpenseBtn');
  const incomeBtn = document.getElementById('typeIncomeBtn');

  expenseBtn.addEventListener('click', () => setType('expense'));
  incomeBtn.addEventListener('click', () => setType('income'));

  setType('expense');

  // 거래 등록 폼
  document.getElementById('transactionForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const date = dateInput.value;
    const cat = document.getElementById('txCategory').value;
    const title = document.getElementById('txTitle').value.trim();
    const amount = parseInt(document.getElementById('txAmount').value, 10);
    const memo = document.getElementById('txMemo').value.trim();

    if (!title || isNaN(amount) || amount <= 0) {
      alert('올바른 사용처와 금액을 입력하세요.');
      return;
    }

    const newTx = {
      id: "tx_" + Date.now(),
      date,
      type: currentType,
      category: cat,
      title,
      amount,
      memo
    };

    transactions.unshift(newTx);
    saveStorage();

    // 폼 리셋 (날짜 유지)
    document.getElementById('txTitle').value = '';
    document.getElementById('txAmount').value = '';
    document.getElementById('txMemo').value = '';

    render();
  });

  // 예산 설정 버튼
  document.getElementById('setBudgetBtn').addEventListener('click', () => {
    const input = prompt("월간 지출 예산을 입력하세요 (원):", monthlyBudget);
    if (input !== null) {
      const parsed = parseInt(input.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsed) && parsed > 0) {
        monthlyBudget = parsed;
        localStorage.setItem(BUDGET_KEY, monthlyBudget.toString());
        render();
      }
    }
  });
}

function setType(type) {
  currentType = type;
  document.getElementById('typeExpenseBtn').classList.toggle('active', type === 'expense');
  document.getElementById('typeIncomeBtn').classList.toggle('active', type === 'income');

  const catSelect = document.getElementById('txCategory');
  catSelect.innerHTML = '';
  CATEGORIES[type].forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.name;
    opt.innerText = c.name;
    catSelect.appendChild(opt);
  });
}

// 필터 및 정렬 컨트롤
function initFilterControls() {
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      renderTable();
    });
  });

  document.getElementById('searchKeyword').addEventListener('input', (e) => {
    searchKeyword = e.target.value.trim().toLowerCase();
    renderTable();
  });

  document.getElementById('sortSelect').addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderTable();
  });
}

// 백업 및 유틸리티
function initBackupControls() {
  document.getElementById('loadSampleBtn').addEventListener('click', () => {
    if (confirm('평가 시연용 샘플 데이터를 추가하시겠습니까?')) {
      transactions = [...SAMPLE_TRANSACTIONS];
      saveStorage();
      render();
      alert('샘플 데이터가 성공적으로 로드되었습니다!');
    }
  });

  document.getElementById('exportCsvBtn').addEventListener('click', exportToCSV);
  document.getElementById('backupJsonBtn').addEventListener('click', exportToJSON);

  document.getElementById('resetDataBtn').addEventListener('click', () => {
    if (confirm('정말로 모든 가계부 데이터를 초기화하시겠습니까?')) {
      transactions = [];
      saveStorage();
      render();
    }
  });
}

function exportToCSV() {
  if (transactions.length === 0) {
    alert('내보낼 데이터가 없습니다.');
    return;
  }
  let csv = "\uFEFF일자,구분,카테고리,사용처/내역,금액,메모\n";
  transactions.forEach(t => {
    const typeKor = t.type === 'income' ? '수입' : '지출';
    csv += `"${t.date}","${typeKor}","${t.category}","${t.title.replace(/"/g, '""')}","${t.amount}","${(t.memo||'').replace(/"/g, '""')}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `moneylog_${currentYear}_${String(currentMonth).padStart(2,'0')}.csv`;
  a.click();
}

function exportToJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions, null, 2));
  const a = document.createElement('a');
  a.href = dataStr;
  a.download = `moneylog_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
}

// 전체 렌더링
function render() {
  document.getElementById('currentMonthLabel').innerText = `${currentYear}년 ${currentMonth}월`;
  
  // 당월 데이터 필터링
  const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  const monthList = transactions.filter(t => t.date.startsWith(monthPrefix));

  // 통계 계산
  let totalIncome = 0;
  let totalExpense = 0;
  const catExpenseMap = {};

  monthList.forEach(t => {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
      catExpenseMap[t.category] = (catExpenseMap[t.category] || 0) + t.amount;
    }
  });

  const netBalance = totalIncome - totalExpense;

  // 대시보드 반영
  document.getElementById('totalIncome').innerText = `+${totalIncome.toLocaleString()}원`;
  document.getElementById('totalExpense').innerText = `-${totalExpense.toLocaleString()}원`;
  
  const balanceEl = document.getElementById('netBalance');
  balanceEl.innerText = `${netBalance >= 0 ? '+' : ''}${netBalance.toLocaleString()}원`;
  balanceEl.style.color = netBalance >= 0 ? 'var(--income)' : 'var(--expense)';

  // 예산 소진율
  const budgetRatio = monthlyBudget > 0 ? Math.round((totalExpense / monthlyBudget) * 100) : 0;
  document.getElementById('budgetRatioText').innerText = `${budgetRatio}%`;
  document.getElementById('budgetDetailText').innerText = `${totalExpense.toLocaleString()}원 / ${monthlyBudget.toLocaleString()}원`;
  const fillBar = document.getElementById('budgetProgressFill');
  fillBar.style.width = `${Math.min(budgetRatio, 100)}%`;
  fillBar.style.background = budgetRatio > 100 ? '#ef4444' : (budgetRatio > 80 ? '#f59e0b' : 'var(--primary)');

  // 카테고리별 지출 통계 바 렌더링
  renderCategoryStats(catExpenseMap, totalExpense);

  // 테이블 렌더링
  renderTable();
}

function renderCategoryStats(catMap, totalExpense) {
  const container = document.getElementById('categoryStatsList');
  container.innerHTML = '';

  const entries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); font-size:13px; text-align:center; padding:20px 0;">지출 내역이 없습니다.</p>';
    return;
  }

  entries.forEach(([cat, amt]) => {
    const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
    const catObj = CATEGORIES.expense.find(c => c.name === cat) || { color: '#64748b' };

    const item = document.createElement('div');
    item.className = 'cat-stat-item';
    item.innerHTML = `
      <div class="cat-stat-header">
        <span>${cat}</span>
        <span><strong>${amt.toLocaleString()}원</strong> <span class="cat-stat-pct">(${pct}%)</span></span>
      </div>
      <div class="cat-bar-bg">
        <div class="cat-bar-fill" style="width: ${pct}%; background: ${catObj.color};"></div>
      </div>
    `;
    container.appendChild(item);
  });
}

function renderTable() {
  const tbody = document.getElementById('txTableBody');
  const emptyEl = document.getElementById('emptyState');
  tbody.innerHTML = '';

  const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  
  // 1. 월 필터
  let filtered = transactions.filter(t => t.date.startsWith(monthPrefix));

  // 2. 탭 필터 (all, expense, income)
  if (currentFilter !== 'all') {
    filtered = filtered.filter(t => t.type === currentFilter);
  }

  // 3. 검색어 필터
  if (searchKeyword) {
    filtered = filtered.filter(t => 
      t.title.toLowerCase().includes(searchKeyword) || 
      (t.memo && t.memo.toLowerCase().includes(searchKeyword)) ||
      t.category.toLowerCase().includes(searchKeyword)
    );
  }

  // 4. 정렬
  filtered.sort((a, b) => {
    if (currentSort === 'date_desc') return b.date.localeCompare(a.date);
    if (currentSort === 'date_asc') return a.date.localeCompare(b.date);
    if (currentSort === 'amount_desc') return b.amount - a.amount;
    if (currentSort === 'amount_asc') return a.amount - b.amount;
    return 0;
  });

  document.getElementById('txCountBadge').innerText = `총 ${filtered.length}건`;

  if (filtered.length === 0) {
    emptyEl.style.display = 'block';
    return;
  } else {
    emptyEl.style.display = 'none';
  }

  filtered.forEach(t => {
    const tr = document.createElement('tr');
    const isIncome = t.type === 'income';

    tr.innerHTML = `
      <td style="color:var(--text-sub);">${t.date}</td>
      <td>
        <span class="badge-tag ${isIncome ? 'badge-income' : 'badge-expense'}">
          ${isIncome ? '수입' : '지출'} · ${t.category}
        </span>
      </td>
      <td>
        <strong>${escapeHtml(t.title)}</strong>
        ${t.memo ? `<span class="tx-memo">${escapeHtml(t.memo)}</span>` : ''}
      </td>
      <td style="text-align: right;">
        <span class="tx-amount ${isIncome ? 'income' : 'expense'}">
          ${isIncome ? '+' : '-'}${t.amount.toLocaleString()}원
        </span>
      </td>
      <td style="text-align: center;">
        <button class="btn-del" title="내역 삭제" data-id="${t.id}">✕</button>
      </td>
    `;

    tr.querySelector('.btn-del').addEventListener('click', () => {
      if (confirm(`'${t.title}' 내역을 삭제하시겠습니까?`)) {
        transactions = transactions.filter(item => item.id !== t.id);
        saveStorage();
        render();
      }
    });

    tbody.appendChild(tr);
  });
}

function escapeHtml(text) {
  const d = document.createElement('div');
  d.innerText = text;
  return d.innerHTML;
}
