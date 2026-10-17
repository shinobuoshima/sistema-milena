bplist00ÑXUTI-DataÑZpublic.rtf_(U{\rtf1\ansi\ansicpg1252\cocoartf2908
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 AppleSystemUIFont;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\deftab560
\pard\pardeftab560\slleading20\pardirnatural\partightenfactor0

\f0\fs26 \AppleTypeServices\AppleTypeServicesF2293774 \cf0 \
/*\
  FINANCEIRO MILENA\
  Antes de usar, preencha as credenciais do seu projeto Supabase.\
*/\
\
const SUPABASE_URL = "COLE_A_URL_DO_SEU_PROJETO";\
const SUPABASE_ANON_KEY = "COLE_SUA_CHAVE_PUBLICA_ANON";\
\
const configured =\
  SUPABASE_URL.startsWith("https://") &&\
  !SUPABASE_URL.includes("COLE_A_") &&\
  !SUPABASE_ANON_KEY.includes("COLE_SUA_");\
\
const db = configured\
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)\
  : null;\
\
const $ = (id) => document.getElementById(id);\
\
let currentUser = null;\
let transactions = [];\
\
const money = (value) =>\
  Number(value).toLocaleString("pt-BR", \{\
    style: "currency",\
    currency: "BRL"\
  \});\
\
function localDate() \{\
  const now = new Date();\
  const offset = now.getTimezoneOffset() * 60000;\
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);\
\}\
\
function message(id, text) \{\
  $(id).textContent = text;\
\}\
\
function showApp(isLoggedIn) \{\
  $("authSection").classList.toggle("hidden", isLoggedIn);\
  $("appSection").classList.toggle("hidden", !isLoggedIn);\
  $("logoutBtn").classList.toggle("hidden", !isLoggedIn);\
\}\
\
function setBusy(buttonId, busy, label) \{\
  const button = $(buttonId);\
  if (busy) \{\
    button.dataset.originalText = button.textContent;\
    button.textContent = label;\
  \} else \{\
    button.textContent = button.dataset.originalText || label;\
  \}\
  button.disabled = busy;\
\}\
\
function friendlyError(error) \{\
  if (!error) return "Ocorreu um erro inesperado.";\
\
  if (error.message?.includes("Invalid login credentials")) \{\
    return "E-mail ou senha incorretos.";\
  \}\
\
  if (error.message?.includes("Email not confirmed")) \{\
    return "Confirme seu e-mail antes de entrar.";\
  \}\
\
  if (error.code === "42P01" || error.code === "PGRST205") \{\
    return "A tabela de lan\'e7amentos ainda n\'e3o foi criada no Supabase.";\
  \}\
\
  if (error.code === "42501") \{\
    return "Acesso bloqueado pelas regras de seguran\'e7a do banco.";\
  \}\
\
  return error.message || "N\'e3o foi poss\'edvel concluir a opera\'e7\'e3o.";\
\}\
\
// LOGIN\
$("authForm").addEventListener("submit", async (event) => \{\
  event.preventDefault();\
\
  if (!db) \{\
    message("authMessage", "Configure a URL e a chave do Supabase no script.js.");\
    return;\
  \}\
\
  setBusy("loginBtn", true, "Entrando...");\
  message("authMessage", "");\
\
  try \{\
    const \{ error \} = await db.auth.signInWithPassword(\{\
      email: $("email").value.trim(),\
      password: $("password").value\
    \});\
\
    if (error) throw error;\
\
    message("authMessage", "Login realizado.");\
  \} catch (error) \{\
    message("authMessage", friendlyError(error));\
  \} finally \{\
    setBusy("loginBtn", false, "Entrar");\
  \}\
\});\
\
// CRIAR CONTA\
$("signupBtn").addEventListener("click", async () => \{\
  if (!db) \{\
    message("authMessage", "Configure primeiro as credenciais do Supabase.");\
    return;\
  \}\
\
  const email = $("email").value.trim();\
  const password = $("password").value;\
\
  if (!email || password.length < 6) \{\
    message("authMessage", "Informe um e-mail e uma senha de pelo menos 6 caracteres.");\
    return;\
  \}\
\
  setBusy("signupBtn", true, "Criando...");\
  message("authMessage", "");\
\
  try \{\
    const \{ data, error \} = await db.auth.signUp(\{\
      email,\
      password\
    \});\
\
    if (error) throw error;\
\
    if (data.session) \{\
      message("authMessage", "Conta criada com sucesso.");\
    \} else \{\
      message(\
        "authMessage",\
        "Conta criada. Verifique seu e-mail para confirmar o cadastro."\
      );\
    \}\
  \} catch (error) \{\
    message("authMessage", friendlyError(error));\
  \} finally \{\
    setBusy("signupBtn", false, "Criar conta");\
  \}\
\});\
\
// SAIR DA CONTA\
$("logoutBtn").addEventListener("click", async () => \{\
  if (!db) return;\
\
  const \{ error \} = await db.auth.signOut();\
\
  if (error) \{\
    alert(friendlyError(error));\
  \}\
\});\
\
// NOVO LAN\'c7AMENTO\
$("transactionDate").value = localDate();\
\
$("transactionForm").addEventListener("submit", async (event) => \{\
  event.preventDefault();\
\
  if (!db || !currentUser) return;\
\
  const type = $("type").value;\
  const description = $("description").value.trim();\
  const amount = Number($("amount").value);\
  const transactionDate = $("transactionDate").value;\
\
  if (!["entrada", "saida"].includes(type)) \{\
    message("formMessage", "Selecione um tipo v\'e1lido.");\
    return;\
  \}\
\
  if (!description || !Number.isFinite(amount) || amount <= 0) \{\
    message("formMessage", "Informe uma descri\'e7\'e3o e um valor maior que zero.");\
    return;\
  \}\
\
  if (!transactionDate || transactionDate > localDate()) \{\
    message("formMessage", "Informe uma data v\'e1lida, sem data futura.");\
    return;\
  \}\
\
  setBusy("saveBtn", true, "Salvando...");\
  message("formMessage", "");\
\
  try \{\
    const \{ error \} = await db.from("transactions").insert(\{\
      user_id: currentUser.id,\
      type,\
      description,\
      amount,\
      transaction_date: transactionDate\
    \});\
\
    if (error) throw error;\
\
    $("transactionForm").reset();\
    $("transactionDate").value = localDate();\
    $("type").value = "entrada";\
\
    message("formMessage", "Lan\'e7amento salvo com sucesso!");\
    await loadTransactions();\
  \} catch (error) \{\
    message("formMessage", friendlyError(error));\
  \} finally \{\
    setBusy("saveBtn", false, "Salvar lan\'e7amento");\
  \}\
\});\
\
// CONSULTAR HIST\'d3RICO\
async function loadTransactions() \{\
  if (!db || !currentUser) return;\
\
  $("history").replaceChildren();\
\
  const loading = document.createElement("p");\
  loading.textContent = "Carregando lan\'e7amentos...";\
  $("history").append(loading);\
\
  try \{\
    const \{ data, error \} = await db\
      .from("transactions")\
      .select("id, type, description, amount, transaction_date, created_at")\
      .eq("user_id", currentUser.id)\
      .order("transaction_date", \{ ascending: false \})\
      .order("created_at", \{ ascending: false \});\
\
    if (error) throw error;\
\
    transactions = data || [];\
    renderTransactions();\
  \} catch (error) \{\
    $("history").replaceChildren();\
    const errorText = document.createElement("p");\
    errorText.textContent = friendlyError(error);\
    $("history").append(errorText);\
  \}\
\}\
\
// ATUALIZAR SALDOS E HIST\'d3RICO\
function renderTransactions() \{\
  const income = transactions\
    .filter((item) => item.type === "entrada")\
    .reduce((sum, item) => sum + Number(item.amount), 0);\
\
  const expense = transactions\
    .filter((item) => item.type === "saida")\
    .reduce((sum, item) => sum + Number(item.amount), 0);\
\
  $("balance").textContent = money(income - expense);\
  $("incomeTotal").textContent = money(income);\
  $("expenseTotal").textContent = money(expense);\
\
  const history = $("history");\
  history.replaceChildren();\
\
  if (transactions.length === 0) \{\
    const empty = document.createElement("p");\
    empty.textContent = "Nenhum lan\'e7amento registrado ainda.";\
    history.append(empty);\
    return;\
  \}\
\
  for (const item of transactions) \{\
    const card = document.createElement("article");\
    card.className = "transaction";\
\
    const details = document.createElement("div");\
    const title = document.createElement("strong");\
    title.textContent = item.description;\
\
    const date = document.createElement("p");\
    date.textContent = new Date(\
      `$\{item.transaction_date\}T12:00:00`\
    ).toLocaleDateString("pt-BR");\
\
    const kind = document.createElement("p");\
    kind.textContent = item.type === "entrada" ? "Entrada" : "Sa\'edda";\
    kind.className = item.type;\
\
    details.append(title, date, kind);\
\
    const values = document.createElement("div");\
    values.className = "amount";\
\
    const amount = document.createElement("strong");\
    amount.className = item.type;\
    amount.textContent =\
      `$\{item.type === "entrada" ? "+" : "\uc0\u8722 "\} $\{money(item.amount)\}`;\
\
    const deleteButton = document.createElement("button");\
    deleteButton.className = "delete-btn";\
    deleteButton.type = "button";\
    deleteButton.textContent = "Excluir";\
    deleteButton.addEventListener("click", () => deleteTransaction(item.id));\
\
    values.append(amount, deleteButton);\
    card.append(details, values);\
    history.append(card);\
  \}\
\}\
\
// EXCLUIR LAN\'c7AMENTO\
async function deleteTransaction(id) \{\
  if (!db || !currentUser) return;\
\
  const confirmed = window.confirm(\
    "Deseja realmente excluir este lan\'e7amento? Essa a\'e7\'e3o n\'e3o pode ser desfeita."\
  );\
\
  if (!confirmed) return;\
\
  try \{\
    const \{ error \} = await db\
      .from("transactions")\
      .delete()\
      .eq("id", id)\
      .eq("user_id", currentUser.id);\
\
    if (error) throw error;\
\
    await loadTransactions();\
  \} catch (error) \{\
    alert(friendlyError(error));\
  \}\
\}\
\
$("refreshBtn").addEventListener("click", loadTransactions);\
\
// RESTAURAR SESS\'c3O E ACOMPANHAR LOGIN\
async function initialize() \{\
  if (!db) \{\
    showApp(false);\
    message(\
      "authMessage",\
      "Configure a URL e a chave p\'fablica do Supabase no script.js."\
    );\
    return;\
  \}\
\
  const \{ data, error \} = await db.auth.getSession();\
\
  if (error) \{\
    message("authMessage", friendlyError(error));\
    return;\
  \}\
\
  currentUser = data.session?.user || null;\
  showApp(Boolean(currentUser));\
\
  if (currentUser) \{\
    await loadTransactions();\
  \}\
\
  db.auth.onAuthStateChange((event, session) => \{\
    currentUser = session?.user || null;\
    showApp(Boolean(currentUser));\
\
    if (currentUser) \{\
      setTimeout(() => loadTransactions(), 0);\
    \} else \{\
      transactions = [];\
    \}\
  \});\
\}\
\
initialize();\
}     "                           ({