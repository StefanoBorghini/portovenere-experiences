# Contratto partner

Aggiungi qui il PDF reale del contratto/termini di abbonamento, con
nome file esatto:

```
partner-contract.pdf
```

Viene allegato automaticamente dal bottone "Invia contratto" in
`/admin/affiliates/[id]` (route `/api/admin/partners/[id]/send-contract`).
Finché questo file non esiste, quel bottone risponde con un errore
esplicito invece di mandare un'email senza allegato.

È lo stesso PDF per tutti i piani (Base/Premium/Signature) — se in
futuro serve un contratto diverso per piano, va aggiunta la logica
di selezione nella route sopra.
