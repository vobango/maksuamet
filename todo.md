# Koori andmebaas

## Praegu olemas
### Liikme lisamine
  liikme väljad:
 - konto/kasutaja tüüp
 - arved
 - bilanss
 - andmed - nimi, e-mail, telefoni nr, isikukood, aktiivne (bool)
### Liikme redigeerimine
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
- [x] kontrollida, kas arve lisamine töötab õigesti?
- [x] summade / soodustuste jms arvutamine
- [x] andmebaasi korrektne salvestamine
- [x] faili upload
- [ ] docker image uuendada / uuendamine automatiseerida
- [x] docker vol lisada
- [x] Tarmo masinasse asi käima
- [x] eraldi front tavakasutaja jaoks
    - /api otsade pealt võetud info kuvamine lihtsates vaadetes:
    - kasutajate tabel (nimi + bilanss)
    - sündmuste tabel
    - kasutaja detailvaade
- [x] Liikme väljad:
  - tudengi staatus
- [x] liikme redigeerimine
- [x] arve lisamine
  - [x] näita ainult aktiivseid liikmeid
  - [x] saajate kiirvalikud ("vali ainult tudengid" jne)
  - [x] arve märkimine makstuks + saaja bilansi uuendamine
  - [x] olemasoleva arve redigeerimine
  - [x] arvete sorteerimine, filtreerimine
- [x] liikmete sorteerimine, filtreerimine
- [ ] kolmanda osapoole schema
  - [ ] väljad:
    - nimi
    - aadress
    - registrikood (optional)
    - arved
- [x] error handling
- [ ] JWT peale lülitada nginx auth pealt
