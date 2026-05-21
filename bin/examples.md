!PATTERN: HELLO_WORLD
!FILE: hello.n6q
∆saluto "Hello, World!"
⮑ saluto
!INVOKE: nexusq run hello.n6q

!PATTERN: FILE_ANALYSIS
!FILE: analyze.n6q
∆content: ⟵ "data.txt"
∆lines: content ⫽ "\n"
∆non_empty: ⋈ lines [l | |l| > 0]
⮑ { total: |lines|, non_empty: |non_empty|, first: ✂ content [0, 50] }
!INVOKE: nexusq run analyze.n6q

!PATTERN: HTTP_MICROSERVICE
!FILE: create_user.n6q
∆payload: ∇
⊕Users[payload.id] { "name": payload.name }
⮑ { "status": "CREATED", "user_id": payload.id }
!INVOKE: curl -X POST http://localhost:2823/api/v1/execute/create_user -d '{"id": "user1", "name": "API_Test"}'

!PATTERN: PROMO_VALIDATION
!FILE: checkout.n6q
∆req: ∇
∆cliente: ⌕Clienti[req.client_id]
∃cliente
∆promo: ⌕Promozioni[req.promo_code]
∃promo
⟨ cliente.punti > promo.punti_minimi | 
  ⊕Storico[req.id]{stato: "Approvato"} 
  ⮑ promo.sconto 
| 
  ⊕Storico[req.id]{stato: "Rifiutato"} 
  ⮑ 0 
⟩
!INVOKE: nexusq run checkout.n6q --payload '{"client_id": "C-445", "promo_code": "PROMO-X"}'

!PATTERN: ASSERT_EXISTENCE
!FILE: assert.n6q
∆missing: ⌕Products["P-999"]
∃missing // Throws "Assertion failed: 'missing' is Null or not found" — catchable by ¿!

!PATTERN: FOREACH_LOOP
!FILE: import.n6q
∆req: ∇
∀ u ∈ req.users ⟨
  ⊕Users[u.id]{nome: u.name}
⟩
⮑ "Import completed"

!PATTERN: WHILE_LOOP
!FILE: retry.n6q
∆counter 0
↻ counter < 5 ⟨
  ∆counter: counter + 1
  ⊕Logs["L-" + counter]{msg: "Iteration done"}
⟩
⮑ counter

!PATTERN: LINQ_CHAINING
!FILE: linq.n6q
∆payload: ∇
∆valid_products: ⋈ payload.products [ p | p.price > 0 ]
∆prices: ↦ valid_products [ p | p.price ]
∆total: Σ prices [acc, p | acc + p] 0
∆sorted: ⇅ valid_products [ p | p.price ]
⮑ { "count": |valid_products|, "total_value": total, "cheapest": ✂ sorted [0, 1] }

!PATTERN: ERROR_HANDLING
!FILE: try_catch.n6q
∆wallet: 50
∆prezzo: 200
¿ ⟨
  ⟨ wallet < prezzo | ⇑ "Fondi insufficienti: servono " + prezzo ⟩
  ⮑ "Acquisto completato"
⟩ ! ⟨
  ⮑ { errore: ε, wallet: wallet }
⟩ ω ⟨
  ⊕AuditLog[⌖]{evento: "transaction_attempt"}
⟩

!PATTERN: MATCH_DISPATCH
!FILE: state_machine.n6q
∆stato: "confirmed"
⎇ stato ⟨
  "pending"   → ⮑ "In attesa"
  "confirmed" → ⮑ "Pronto"
  _           → ⇑ "Stato sconosciuto: " + stato
⟩

!PATTERN: COMPOUND_LOGIC
!FILE: logic_demo.n6q
∆payload: ∇
⊢ payload {voto: "Int", lode: "Bool"}
// ASCII comparison: >=, <=, >, < (never ≥ or ≤)
// Unicode logic: ∧ (AND), ∨ (OR), ¬ (NOT)
⟨ payload.voto < 18 ∨ payload.voto > 30 | ⇑ "Voto fuori range 18-30" ⟩
⟨ payload.voto < 30 ∧ payload.lode | ⇑ "Lode solo con voto 30" ⟩
∆is_valid: payload.voto >= 18 ∧ payload.voto <= 30
∆has_honors: payload.voto ≡ 30 ∧ payload.lode
∆label: ⟨ ¬has_honors | "Standard" | "Cum Laude" ⟩
⮑ {valid: is_valid, honors: has_honors, label: label}

!PATTERN: CRUD_OPERATIONS
!FILE: crud.n6q
⊕Prodotti["P-001"]{nome: "Widget", prezzo: 100, attivo: True}
∆originale: ⌕Prodotti["P-001"]
⊗Prodotti["P-001"]{prezzo: 80, attivo: False}
∆aggiornato: ⌕Prodotti["P-001"]
∅Prodotti["P-001"]
⮑ {"orig": originale, "agg": aggiornato}

!PATTERN: UPSERT
!FILE: upsert.n6q
∆payload: ∇
¿ ⟨
  ⊕Users[payload.id]{name: payload.name, score: 0}
⟩ ! ⟨
  ⊗Users[payload.id]{name: payload.name}
⟩
⮑ "Done"

!PATTERN: MATH_AND_STRINGS
!FILE: math_str.n6q
∆prezzo 29.99
∆arrotondato: ⌊prezzo * 4⌉
∆nome_pulito: ⌧"  Widget Deluxe  "
∆nome_upper: ↑nome_pulito
∆e_deluxe: nome_pulito ∋ "Deluxe"
∆parti: nome_pulito ⫽ " "
∆csv: parti ⊞ ","
⮑ { "prezzo": arrotondato, "nome": nome_upper, "deluxe": e_deluxe, "csv": csv }

!PATTERN: FUNCTIONS_AND_IMPORTS
!FILE: main.n6q
∞ "libs/math.n6q"
Φ calcola_imposte [importo, tassa] ⟨
    ⮑ importo * 1.22 + tassa
⟩
⮑ calcola_imposte(100, 10)

!PATTERN: ORCHESTRATOR_LAMBDA
!FILE: demo.n6q
∆r1: λ "scripts/crea_studente" {"id": "MAT001", "nome": "Mario"}
∆r2: λ "scripts/crea_studente" {"id": "MAT002", "nome": "Laura"}
⮑ { "r1": r1, "r2": r2 }

!PATTERN: FIND_ALL_WHERE
!FILE: queries.n6q
∆tutti: ⌕Studente[*]
∆rossi: ⌕Studente[* | cognome ≡ "Rossi"]
∆informatici: ⌕Studente[* | corso ≡ "Informatica"]
⮑ {"totale": |tutti|, "rossi": rossi, "informatici": informatici}

!PATTERN: INPUT_VALIDATION
!FILE: validate.n6q
∆payload: ∇
⊢ payload {nome: "String", cognome: "String", email: "String", eta: "Int"}
⊕Utente[payload.email]{ nome: payload.nome, eta: payload.eta }
⮑ "Valid and inserted"

!PATTERN: VALIDATED_CRUD
!FILE: validated_crud.n6q
∆payload: ∇
// Validate + business rules + insert with error handling
⊢ payload {nome: "String", prezzo: "Float", categoria: "String"}
⟨ payload.prezzo <= 0 | ⇑ "Prezzo deve essere positivo" ⟩
⟨ payload.nome ∋ " " ∧ |payload.nome| < 3 | ⇑ "Nome troppo corto" ⟩
∆id: ⌖
¿ ⟨
  ⊕Prodotti[id]{nome: payload.nome, prezzo: payload.prezzo, cat: payload.categoria, attivo: True}
⟩ ! ⟨
  ⮑ {status: "error", message: ε}
⟩
⮑ {status: "created", id: id}

!PATTERN: MULTI_FILTER
!FILE: multi_filter.n6q
∆payload: ∇
∆tutti: ⌕Prodotti[*]
// Filter with compound logic: ∧ (AND), ∨ (OR), ¬ (NOT)
∆attivi_costosi: ⋈ tutti [p | p.attivo ∧ p.prezzo > 50]
∆scontabili: ⋈ tutti [p | p.prezzo >= 10 ∧ p.prezzo <= 100 ∧ ¬p.in_promo]
∆cat_match: ⋈ tutti [p | p.cat ≡ "Elettronica" ∨ p.cat ≡ "Accessori"]
∆ordinati: ⇵ attivi_costosi [p | p.prezzo]
⮑ {costosi: |attivi_costosi|, scontabili: scontabili, categorie: cat_match, top: ✂ ordinati [0, 3]}

!PATTERN: TIMESTAMPS_AND_UUID
!FILE: identity.n6q
∆order_id: ⌖
⊕Orders[order_id]{ created_iso: ⌚, created_epoch: ⏱, status: "pending" }
⮑ order_id

!PATTERN: FILE_IO
!FILE: report.n6q
∆report { id: ⌖, generated_at: ⌚, items: [1, 2, 3] }
⟶ "reports/daily.json" report
∆readback: ⟵ "reports/daily.json"
⮑ {"written": true, "bytes": |readback|}

!PATTERN: HTTP_CLIENT
!FILE: api_call.n6q
∆new_post: ⊳ "https://api.example.com/posts" {
  method: "POST",
  body: {title: "Nexus-Q", userId: 1},
  headers: {Authorization: "Bearer abc"}
}
⮑ { "status": new_post.status, "body": new_post.body, "ok": new_post.ok }

!PATTERN: LOGGING
!FILE: debug.n6q
∆x: ◉ 42 + 8 // As EXPRESSION: Logs "[◉ LOG] 50" to stderr, x gets 50
∆items [{price: 10}, {price: 5}, {price: 20}]
∆sorted: ◉ ⇅ items [i | i.price] // As EXPRESSION: Logs sorted array, sorted gets the result
◉ sorted // As STATEMENT: logs to stderr, no variable needed
⮑ x

!PATTERN: TERNARY_EXPRESSION
!FILE: demo.n6q
∆payload: ∇
∆age: payload.age ?? 0
// ⟨⟩ as EXPRESSION (ternary): returns a value directly into ∆
∆label: ⟨ age > 18 | "adult" | "minor" ⟩
∆discount: ⟨ label ≡ "adult" | 0.1 | 0.0 ⟩
∆msg: ⟨ age > 0 | "Age: " + age | "No age provided" ⟩
⮑ {label: label, discount: discount, message: msg}

!PATTERN: PARENTHESIZED_EXPRESSIONS
!FILE: parens.n6q
∆curr: 5
// Parentheses control operator precedence — no need for temp variables
∆dow: (curr + 1) % 7
∆area: (3 + 4) * (10 - 2)
∆nested: ((2 + 3) * (4 - 1)) + 1
// Parentheses with logical operators
∆a: true
∆b: false
∆c: true
∆logic: (a ∧ b) ∨ c
// Combine with ternary and comparison
∆score: 85
∆grade: ⟨ score >= 90 | "A" | ⟨ score >= (50 + 30) | "B" | "C" ⟩ ⟩
⮑ {dow: dow, area: area, nested: nested, logic: logic, grade: grade}

!PATTERN: ASSERT_WITH_TRY
!FILE: safe_assert.n6q
// ∃ now reports which variable failed — use inside ¿! for graceful handling
∆user: ⌕Users["U-999"]
¿ ⟨
  ∃user
  ⮑ user
⟩ ! ⟨
  // ε will contain: "Assertion failed: 'user' is Null or not found"
  ⮑ {status: "error", message: ε}
⟩
