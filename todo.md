# Koori andmebaas

## Praegu olemas
### Liikme lisamine
  liikme väljad:
 - konto/kasutaja tüüp
 - arved
 - bilanss
 - andmed - nimi, e-mail, telefoni nr, isikukood, aktiivne (bool)
### Arve lisamine
  arve väljad:
  - kuupäev
  - esitamise kuupäev
  - summa
  - kirjeldus
  - teenuse kogus
  - arve fail
  - saaja
  - käibemaks
  - soodustus
  - makstud summa
  - Liikmete list
  - Arvete list


## Vaja teha
- [ ] dokumentatsioon + testid
- [ ] kontrollida, kas arve lisamine töötab õigesti?
- [ ] summade / soodustuste jms arvutamine
- [ ] andmebaasi korrektne salvestamine
- [ ] faili upload
- [ ] docker image uuendada / uuendamine automatiseerida
- [ ] docker vol lisada
- [ ] Tarmo masinasse asi käima
- [ ] front eraldi, praeguste render asemele REST API
- [ ] Liikme väljad:
  - tudengi staatus
- [ ] liikme redigeerimine
- [ ] arve lisamine
- [ ] näita ainult aktiivseid liikmeid
- [ ] saajate kiirvalikud ("vali ainult tudengid" jne)
- [ ] arve märkimine makstuks + saaja bilansi uuendamine
- [ ] olemasoleva arve redigeerimine
- [ ] arvete sorteerimine, filtreerimine
- [ ] liikmete sorteerimine, filtreerimine
- [ ] kolmanda osapoole schema
- [ ] väljad:
    - nimi
    - aadress
    - registrikood (optional)
    - arved
- [ ] error handling