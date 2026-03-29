#  Badhus-utbildning

En interaktiv utbildningsapplikation för städning och underhåll i badhusmiljö.  
Utvecklad för att ge personal en tydlig, praktisk och standardiserad genomgång av viktiga moment.

---

##  Funktioner

-  **Modulbaserad utbildning**
  - Gå igenom steg-för-steg instruktioner
  - Bilder och praktiska exempel

-  **Kunskapstest (quiz)**
  - Efter varje modul
  - Krävs för att gå vidare i utbildningsläget

-  **Repetitionsläge**
  - Fri navigering mellan moduler
  - Perfekt för repetition utan test

-  **Certifikat**
  - Genereras som PDF efter genomförd utbildning

-  **Desktop-app**
  - Byggd med Electron

---

##  Teknologier

- React + TypeScript
- Vite
- Electron
- CSS (neobrutalistisk design)

---

##  Applikationsflöde

### 🎓 Utbildningsläge
1. Starta utbildning  
2. Gå igenom modul  
3. Gör quiz  
4. Lås upp nästa modul  
5. Få certifikat  

###  Repetitionsläge
- Gå direkt till moduler  
- Öppna valfri modul  
- Ingen låsning eller test krävs  

---

##  Projektstruktur

```bash
app/
  src/
    components/     # UI-komponenter (t.ex. SlidePlayer)
    pages/          # Sidor (Start, Modules, Quiz, etc.)
    modules/        # Innehåll + quiz per modul
    styles/         # CSS
    pdf/            # Certifikatgenerering
```

---

### Installation
npm install
### Starta utvecklingsläge
npm run dev
### Starta Electron
npm run electron
### Bygga projektet
npm run build
## Designfilosofi

Projektet använder en neobrutalistisk design:

Tydliga kontraster
Tjocka borders
Skarpa skuggor
Fokus på funktion

## Utvecklare

Mirnes Mrso

## Licens

Intern utbildning – kan anpassas.

## Framtida förbättringar

Progress tracking


Backend
Statistik
Fler moduler
