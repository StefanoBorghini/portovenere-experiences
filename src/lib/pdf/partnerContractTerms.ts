// =========================================================
// Clausole del contratto di abbonamento partner.
//
// Questo e' l'UNICO file da modificare per aggiornare il testo
// legale del contratto: generatePartnerContractPdf() importa
// questo array cosi' com'e' e lo stampa dopo i dati dell'attivita'.
//
// Bozza scritta secondo le indicazioni esplicite del titolare
// (rinnovo automatico, recesso libero senza rimborso di quanto gia'
// versato, pagamento via Stripe). NON e' una certificazione legale —
// e' un punto di partenza solido, non testo validato da un avvocato.
// Prima di usarla su larga scala con centinaia di attivita', una
// revisione legale anche breve resta consigliata: i punti
// "[DA COMPLETARE]" sono dati identificativi mancanti (non termini
// da negoziare), il resto e' gia' testo sostanziale.
// =========================================================

export const PARTNER_CONTRACT_TITLE = "Contratto di Abbonamento — Portovenere Experience";

export const PARTNER_CONTRACT_CLAUSES: string[] = [
  "1. Oggetto del contratto\nPortovenere Experience fornisce all'attivita' partner un servizio di visibilita' sulla piattaforma Portovenere Experience, con le caratteristiche corrispondenti al piano di abbonamento sottoscritto (Base, Premium o Signature) indicato sopra.",

  "2. Durata e rinnovo automatico\nL'abbonamento ha durata di 12 mesi a partire dalla data di attivazione indicata sopra. Alla scadenza, l'abbonamento si rinnova automaticamente per ulteriori 12 mesi alle stesse condizioni economiche, salvo disdetta comunicata dall'attivita' partner prima della data di rinnovo secondo quanto previsto all'art. 4.",

  "3. Corrispettivo e modalita' di pagamento\nIl corrispettivo dovuto e' quello indicato sopra in base al piano sottoscritto. Il pagamento avviene tramite Stripe, alla sottoscrizione iniziale e a ogni rinnovo automatico. Portovenere Experience si riserva di sospendere il servizio in caso di mancato pagamento.",

  "4. Recesso\nL'attivita' partner puo' recedere dal presente contratto in qualsiasi momento, senza vincoli di preavviso ne' penali, comunicandolo a Portovenere Experience. Il recesso ha effetto sulla disattivazione del rinnovo automatico: gli importi gia' versati per il periodo di abbonamento in corso non sono rimborsabili, e il servizio resta attivo fino al termine del periodo gia' pagato.",

  "5. Obblighi delle parti\nPortovenere Experience si impegna a mantenere la scheda dell'attivita' pubblicata sulla piattaforma secondo i termini del piano sottoscritto per tutta la durata dell'abbonamento. L'attivita' partner si impegna a fornire informazioni veritiere e ad aggiornarle tempestivamente in caso di variazioni.",

  "6. Trattamento dei dati personali\nI dati personali forniti in fase di candidatura e sottoscrizione sono trattati da Portovenere Experience in conformita' al Regolamento (UE) 2016/679 (GDPR), secondo quanto gia' indicato in sede di candidatura su /become-a-partner.",

  "7. Legge applicabile e foro competente\nIl presente contratto e' regolato dalla legge italiana. Per qualsiasi controversia e' competente il foro previsto dalla legge applicabile.",

  "[DA COMPLETARE] Dati identificativi di Portovenere Experience (ragione sociale, sede legale, P.IVA) da inserire in questa sezione o nell'intestazione del documento prima dell'uso con attivita' reali.",
];
