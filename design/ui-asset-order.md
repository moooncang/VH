# 골목 시술소 사이트 UI 그림 납품요구서

작성 2026-10-15 · 의뢰 문창놈 · 대상 사이트 https://moooncang.github.io/VH/

지금 사이트의 팻말·버튼·종이·액자·커튼·병 같은 장식은 전부 코드(CSS 도형)로 그려져 있습니다. 이 문서는 그 장식을 하나하나 **작가님 원본 그림체 그대로** 그린 이미지로 바꾸기 위한 주문서입니다. 아래 순서대로 한 항목씩 생성해서 납품해 주세요.

---

## 0. 그림체 기준 (모든 항목 공통, 최우선)

### 참고 그림 (반드시 첨부)
- `design/style-reference.webp` 기준 시트 1장
- 인물 원본: `images/CS/AP.webp` `BP.webp` `CP.webp` `DP.webp` `EP.webp`
- 배경 원본: `images/B/R.webp`(접수대) `T.webp`(시술실) `P.webp`(조향실) `W.webp`(대기실) `G.webp`(모험가 거리) `U.webp`(다락방)

위 파일만 그림체 기준입니다. `assets/art/*.webp`, `assets/ui/*.webp`는 예전에 다른 그림체로 생성한 것이라 **참고하지 않습니다.**

### 그림체 요약
- 일본 애니메이션 일러스트. 짙은 갈색·검정 잉크 선이 또렷하고 굵기 변화가 있음
- 2~3단 셀 채색 + 부드러운 에어브러시 그라데이션. 금속·유리에는 반짝이는 하이라이트
- 배경은 손그림 애니메이션 배경 질감, 가는 잉크 해칭이 보임
- 빛은 왼쪽 위에서 오는 따뜻한 호박색 램프 빛
- 색: 꿀빛 목재 #a8682a #d89a4a / 짙은 숲 녹색 #1f3a2c #2f5a40 / 낡은 놋쇠 #c9a560 #8d6a2f / 크림 종이 #efe3c6 / 진홍 포인트 #9c3530 / 장미 #d67b7f(예민·달아오름 표시 전용)

### 금지
사실적인 사진풍, 3D 렌더, 플라스틱 같은 게임 UI 광택, 납작한 벡터 아이콘, 워터마크·서명, 인물(별도 지시 없는 한), 노출 표현

### 공통 프롬프트 머리 (각 항목 프롬프트 앞에 그대로 붙여 주세요)
```
Match the attached reference illustrations exactly in drawing style: Japanese anime illustration, confident dark brown-black ink lineart with varied line weight, 2-3 tone cel shading with soft airbrushed gradients, glossy highlights on brass and glass, hand-painted retro anime background texture with fine ink hatching. Warm amber lamplight from the upper left. Palette: honey wood #a8682a #d89a4a, deep forest green #1f3a2c #2f5a40, aged brass #c9a560 #8d6a2f, cream paper #efe3c6, crimson accent #9c3530. NOT photorealistic, NOT 3D render, NOT glossy plastic game UI, NOT flat vector icon. No watermark, no signature, no people.
```

---

## 1. 납품 규격 (공통)

- 형식: PNG, 투명 배경(진짜 알파). 배경판·종이처럼 꽉 찬 항목만 불투명 허용(항목에 표시)
- 크기: 항목에 적힌 픽셀 그대로(화면 표시 크기의 2배, 고해상도 화면 대응)
- 시점: UI 부품은 **정면 평면 시점**. 원근·기울기 없이 똑바로, 캔버스 가운데, 사방 여백 균일
- 상태가 여러 개인 항목은 **모양·크기·위치가 완전히 같고** 빛·색만 다르게. 상태마다 파일 1개
- 늘어나는 틀(9분할 표시 ★): 네 모서리 장식은 적힌 여백 안에만, 가장자리 변은 무늬가 일정하게 반복, 가운데는 비우거나 균일한 면. 사이트가 크기에 맞게 늘려 씁니다
- 파일명: 항목에 적힌 이름 그대로. 납품 위치 `design/incoming/`

### 글자 정책
- **한글은 그림에 넣지 않습니다.** 생성 그림의 한글은 획이 깨지기 쉽고, 문구는 `_build/data.py`에서 수정해야 하므로 사이트가 실제 글자를 위에 얹습니다
- 영문·숫자는 항목에 "글자 포함"이라고 적힌 경우에만 넣습니다. 그 경우에도 **글자 없는 판을 같이 납품**합니다

---

## 2. 공통 조작부

### A-01 주 버튼 판 ★
- 쓰이는 곳: 입장하기, 카르테 열기, 커튼 열기, 출발 상태 복사, 작품으로 들어가기, 시술실 들어가기
- 파일: `btn-primary-idle.png` `btn-primary-hover.png` `btn-primary-press.png`
- 크기 720×200. 모서리 여백 좌우 각 120px, 위아래 각 40px
- 모양: 가로로 긴 놋쇠 명판. 양끝에 작은 잎 장식, 가운데는 무늬 없는 따뜻한 금빛 면(글자 자리). hover는 테두리 빛이 밝아짐, press는 살짝 눌린 음영
```
A long horizontal brass nameplate button, front view, rounded ends with small engraved leaf ornaments at both ends only, smooth warm gold center left completely empty for live text, thin dark ink outline, subtle bevel. Transparent background.
```

### A-02 보조 버튼 판 ★
- 쓰이는 곳: 다음 소문, 커튼 닫기, 골목 소문, 입구로 나가기
- 파일: `btn-secondary-idle.png` `btn-secondary-hover.png` `btn-secondary-press.png`
- 크기 600×160. 모서리 여백 좌우 100px, 위아래 32px
- 모양: 짙은 녹색 가죽 띠에 가는 놋쇠 테. 가운데 비움
```
A slim horizontal button plate of dark forest-green leather with a thin aged brass rim and two tiny rivets at each end, front view, empty center for text. Transparent background.
```

### A-03 둥근 버튼 받침
- 쓰이는 곳: 이전·다음 화살표, 효과음, 메뉴, 닫기, 그림 확대
- 파일: `btn-round-idle.png` `btn-round-hover.png` `btn-round-press.png`
- 크기 192×192
```
A round brass button boss, front view, dark green enamel center left empty, engraved rim, small highlight at upper left. Transparent background.
```

### A-04 아이콘 12종
- 크기 각 128×128, 투명. 선 굵기 통일, 크림색(#efe3c6) 잉크 선 + 얇은 놋쇠 음영. A-03 받침 위에 얹습니다
- 파일: `icon-arrow-right.png` `icon-arrow-left.png` `icon-arrow-down.png` `icon-close.png` `icon-zoom.png` `icon-sound-on.png` `icon-sound-off.png` `icon-menu.png` `icon-bell.png` `icon-copy.png` `icon-check.png` `icon-plus.png`
```
A single small hand-inked icon of [SUBJECT: e.g. a right arrow], cream ink lines with thin brass shading, centered, consistent stroke weight across the set. Transparent background.
```

### A-05 칩·탭 ★
- 쓰이는 곳: 표정 10묶음 선택, 정면·뒷면 전환, 장소 목록, 모바일 안내 목차
- 파일: `chip-idle.png` `chip-active.png`
- 크기 360×96. 모서리 여백 좌우 48px
- 모양: 꼬리표 모양 천 라벨. active는 금빛 자수 테두리
```
A small rounded fabric label tab, dark green cloth with stitched edge, empty center. Active state: gold embroidered border and warmer cloth. Front view, transparent background.
```

### A-06 입력칸 ★
- 쓰이는 곳: 시작 페이지 경과일·소지금·평판·관계 입력
- 파일: `field-idle.png` `field-focus.png`(800×112), `field-area-idle.png` `field-area-focus.png`(800×260)
- 모서리 여백 사방 24px. 가운데는 어두운 종이 면(불투명)
```
An inset writing field: a recessed dark parchment slot inside a thin wooden frame, front view, empty. Focus state: thin glowing gold edge.
```

### A-07 장 구분 장식
- 쓰이는 곳: 모든 섹션 제목 아래 줄, 섹션 번호
- 파일: `divider.png` 1600×48 (가로 반복 가능, 가운데 작은 꽃 장식 1개), `chapter-medal.png` 96×96(가운데 비운 작은 놋쇠 원판, 번호는 사이트가 얹음)

### A-08 꼬리표
- 쓰이는 곳: 출력 견본의 배경·나레이션·인물·대사·정보창 이름표
- 파일: `tag-blank.png` 220×64, 종이 꼬리표 + 끈, 글자 없음

---

## 3. 머리 · 방 안내 · 창

### B-01 로고 (글자 포함)
- 쓰이는 곳: 입구 큰 제목, 화면 왼쪽 위 상호
- 파일: `logo-veilhaun-large.png` 1600×480, `logo-veilhaun-small.png` 560×140
- 글자: **Veilhaun** (영문 그대로). 위에 작은 줄 "THE BACKSTREET PARLOR"는 large에만
- 모양: 간판에 박힌 놋쇠 활자. 획 끝에 세리프, 금빛 그라데이션, 가는 잉크 외곽선
```
Painted brass shop-sign lettering reading exactly "Veilhaun", elegant classic serif letterforms, warm gold gradient with ink outline and a soft glow, front view, transparent background. Small spaced caps above: "THE BACKSTREET PARLOR" (large version only).
```

### B-02 방 안내 메뉴 배경 (불투명)
- 쓰이는 곳: 메뉴 버튼을 누르면 뜨는 전체 화면
- 파일: `menu-backdrop.png` 2880×1800
- 모양: 가게 안쪽 어두운 녹색 벽지와 나무 판자 벽, 오른쪽 위에 램프 빛. 가운데 넓게 비어 있어야 함(메뉴 카드가 올라감)

### B-03 방 안내 카드 판
- 쓰이는 곳: 메뉴 안 6개 방(가게·인물·시술 안내·시술실·베일하운·시작)
- 파일: `menu-card-idle.png` `menu-card-hover.png` `menu-card-current.png` 840×240
- 모양: 벽에 걸린 나무 명패. 왼쪽 정사각 칸(180×180)은 방 아이콘 자리, 오른쪽은 글자 자리로 비움

### B-04 방 아이콘 6종 (교체)
- 지금 `assets/ui/icon-*.webp`가 그림체가 달라 교체합니다
- 파일: `room-ledger.png`(가게: 녹색 가죽 장부) `room-portrait.png`(인물: 타원 초상 액자, 안은 실루엣) `room-bottle.png`(시술 안내: 녹색 향유병) `room-curtain.png`(시술실: 묶인 녹색 커튼) `room-gate.png`(베일하운: 성문) `room-key.png`(시작: 놋쇠 열쇠와 가죽 꼬리표). 각 512×512
- **6개가 같은 시점·같은 빛·같은 크기감**이어야 합니다

### B-05 소문 창 (불투명)
- 쓰이는 곳: 바닥글 "골목 소문" 버튼을 누르면 뜨는 창
- 파일: `rumor-note.png` 1120×880
- 모양: 게시판에 압정으로 꽂힌 누런 쪽지. 위쪽 160px은 제목 자리, 가운데는 넓게 비움

---

## 4. 입구 (index)

### C-01 걸린 간판 (글자 포함)
- 파일: `sign-open.png`(글자: **OPEN**), `sign-blank.png` 각 300×480
- 모양: 위에서 사슬 두 줄로 매단 나무 간판. 놋쇠 테두리, 작은 랜턴 빛이 비침. 사이트가 좌우로 천천히 흔듭니다(축은 맨 위 가운데)

### C-02 접수 벨
- 쓰이는 곳: 입장하기 버튼 옆(누르면 벨 소리)
- 파일: `bell-idle.png` `bell-ring.png` 320×320
- 모양: 접수대용 놋쇠 탁상 종. ring은 종이 살짝 기울고 작은 반짝임 선

### C-03 성인 표시 (숫자 포함)
- 파일: `badge-19.png` 96×96, 진홍 밀랍 도장에 **19**

---

## 5. 가게 (home)

### D-01 영업 현황 명판 (불투명 가능)
- 쓰이는 곳: 첫 화면 아래 예약·평판·직원·단골 후보 4칸
- 파일: `desk-status.png` 2560×200
- 모양: 길고 낮은 놋쇠 명판, **같은 너비의 칸 4개**(칸 사이 세로 장식 줄). 칸 안은 비움

### D-02 영업중 등
- 파일: `lamp-on.png` `lamp-off.png` 128×128, 작은 벽 램프

### D-03 방 카드 액자 (가운데 투명)
- 쓰이는 곳: 인물·시술 안내·시술실·베일하운·시작하기 카드 테두리
- 파일: `room-frame-tall.png` 1000×1200, `room-frame-wide.png` 760×560
- 모양: 얇은 나무 액자 + 모서리 놋쇠 장식. **안쪽은 완전히 투명**(그림이 비쳐야 함). 아래쪽 안쪽에 어두운 그라데이션 띠 포함 가능

### D-04 소문 띠 ★
- 쓰이는 곳: 흐르는 골목 소문 줄
- 파일: `rumor-ribbon.png` 1600×96 (가로 이음매 없이 반복), 낡은 천 띠

### D-05 메뉴판 (불투명, 글자 선택)
- 쓰이는 곳: 시술 메뉴 5줄과 화폐 안내
- 파일: `menu-board-blank.png`, 선택 `menu-board-titled.png`(위에 **MENU**) 각 1440×1100
- 모양: 짙은 녹색 칠판 면 + 나무 틀 + 모서리 놋쇠. 위 160px 제목 자리, 그 아래 5줄 + 아랫단 1줄이 들어갈 만큼 비움

### D-06 예약제 꼬리표
- 파일: `tag-reserved.png` 160×64, 진홍 끈 꼬리표, 글자 없음

### D-07 장부 (불투명)
- 쓰이는 곳: 오늘의 예약, 골목의 평판
- 파일: `ledger-page.png` 1200×1100
- 모양: 펼친 장부 한 쪽. 크림 종이, 가로 줄, 왼쪽 붉은 여백선, 리본 책갈피. 글자 없음

### D-08 평판 도장
- 파일: `rep-empty.png` `rep-stamped.png` 120×120. 빈 원 / 진홍 잉크 도장

### D-09 칸막이 (불투명)
- 쓰이는 곳: 칸막이 너머 목소리
- 파일: `partition.png` 2640×600, `partition-shadow.png` 600×900(투명)
- 모양: 나무 격자 창호지 칸막이, 뒤에서 호박색 빛. 그림자 레이어는 **형태를 알아볼 수 없는 흐릿한 사람 그림자 하나**(노출·자세 묘사 금지)

---

## 6. 인물 (characters)

### E-01 인물 선택 카드
- 파일: `pick-idle.png` `pick-active.png` 560×160
- 모양: 왼쪽 정사각 초상 창(120×120, **투명**)이 있는 나무 이름패. active는 놋쇠 테 빛남. 인물별 색은 사이트가 얹으니 중립 색으로

### E-02 관계도 메달
- 파일: `medal-idle.png` `medal-hover.png` 220×220(가운데 지름 170 원은 투명), `name-ribbon.png` 260×70
- 모양: 둥근 놋쇠 초상 메달 테 / 메달 아래 작은 천 리본

---

## 7. 카르테 (char/*.html, 5인 공통)

### F-01 카르테 용지 (불투명)
- 파일: `karte-sheet.png` 1000×1500
- 모양: 위에 마스킹테이프로 붙인 크림색 진료 기록지. 인쇄된 양식 칸이 있고 **칸 안은 전부 빈칸**
- 칸 배치(위에서부터): 머리 띠 1줄 / 이름 칸(큰 빈 공간, 오른쪽에 도장 자리 원) / 2칸 나란히 1줄(종족·나이) / 긴 칸 4줄(직책·결·예민한 자리·첫 허용선) / 아래 손글씨 메모 칸

### F-02 직인 2종
- 파일: `seal-staff.png`(잎 문양) `seal-guest.png`(열쇠 문양) 240×240
- 모양: 진홍 잉크 원형 도장, 글자 없이 문양만, 살짝 번진 잉크

### F-03 표정 그림 액자 (가운데 투명)
- 파일: `viewer-frame.png` 1840×1280 (안쪽 비율 16:11, 투명)
- 모양: 얇은 나무 액자 + 놋쇠 모서리. 그림을 가리지 않게 테 두께 40px 이내

### F-04 변형 썸네일 틀
- 파일: `thumb-idle.png` `thumb-active.png` 220×130, 가운데 투명

### F-05 결 지도 인체도 (투명)
- 파일: `body-front.png` `body-back.png` 각 600×900
- 모양: 옛 안마 교본 같은 인체 도해. 성별이 드러나지 않는 단순한 마네킹 선화, 똑바로 선 자세, 팔은 몸에서 약간 벌림, 머리 위에서 발끝까지 캔버스 높이의 90%. 옷·노출·근육 묘사 없음
- 납품 후 결 표시 좌표는 제가 그림에 맞춰 조정합니다

### F-06 결 표식
- 파일: `knot-mark.png`(놋쇠빛 실매듭 모양) `knot-sensitive.png`(장미색 빛나는 매듭) 96×96

### F-07 허용선 단계 토큰
- 파일: `step-locked.png` `step-open.png` 160×160
- 모양: 둥근 놋쇠 토큰. locked는 어두운 녹색 에나멜, open은 금빛. 숫자는 사이트가 얹음

### F-08 반응 카드 ★
- 파일: `react-card.png` 640×420, 모서리 여백 48px
- 모양: 어두운 나무 판 위 얇은 놋쇠 테

### F-09 대사 카드 ★
- 파일: `voice-card.png` 760×420, 모서리 여백 56px, 왼쪽 위 큰 따옴표 장식 포함(글자 아님)

### F-10 이전·다음 인물 카드 ★
- 파일: `pager-card.png` 1300×240, 왼쪽 정사각 초상 창 투명

---

## 8. 시술 안내 (rules)

### G-01 목차 책갈피
- 파일: `toc-idle.png` `toc-active.png` 480×110, 천 책갈피 끈 모양

### G-02 결 진행 카드 4단
- 쓰이는 곳: 뻐근함 → 통증 → 감각 과민 → 마력 출력 저하
- 파일: `progress-1.png` `progress-2.png` `progress-3.png` `progress-4.png` 520×200
- 모양: 같은 카드 4장, 단계마다 붉은 기운이 조금씩 짙어짐. 카드 사이 화살표는 사이트가 그림

### G-03 결의 깊이 지층 (불투명)
- 파일: `depth-surface.png`(표층: 호박빛 근육결) `depth-vessel.png`(혈맥: 진홍빛 마력 핏줄) `depth-core.png`(심결: 보랏빛 깊은 핵) 각 2400×280, 가로 반복 가능
- 모양: 마법 해부도 같은 단면 띠. 세 장을 위아래로 붙이면 한 단면도가 되도록 색·결이 이어져야 함

### G-04 달아오름 게이지
- 파일: `heat-tube.png` 1800×120(빈 놋쇠 관), `heat-fill.png` 1800×60(호박→진홍 액체, 왼쪽부터 잘라 씀), `heat-knob.png` 120×120, `heat-ember.png` 240×240(투명 불씨 빛)

### G-05 관계 단계 토큰
- 파일: `relation-locked.png` `relation-open.png` 160×160, F-07과 같은 모양에 장미색

### G-06 향유병 3종
- 파일: `oil-calm.png`(녹색 액체, 둥근 병) `oil-warm.png`(호박색 액체, 각진 병) `oil-unknown.png`(보라 액체, **라벨이 찢긴** 병) 각 360×480
- 라벨은 글자 없는 빈 종이. 세 병 바닥선이 같은 높이

### G-07 선반
- 파일: `shelf.png` 1600×120, 나무 선반 판(가로 반복 가능)

### G-08 향유 메모 ★
- 파일: `oil-note.png` 1500×260, 작은 쪽지, 모서리 여백 40px

---

## 9. 시술실 (treatment)

### H-01 닫힌 커튼 좌·우 (불투명)
- 파일: `curtain-left.png` `curtain-right.png` 각 1500×2000
- 모양: 무거운 녹색 벨벳, 깊은 주름, 안쪽 끝에 금색 술 띠. 좌우가 정확한 대칭

### H-02 걷힌 커튼 좌·우 (투명)
- 파일: `curtain-open-left.png` `curtain-open-right.png` 각 600×2000
- 모양: H-01이 옆으로 모여 놋쇠 고리 끈으로 묶인 상태. 지금 코드는 커튼을 가로로 눌러 줄이는데, 이 그림으로 바꾸면 자연스럽게 걷힌 모습이 됩니다

### H-03 커튼 위 장식
- 파일: `valance.png` 2880×260 (가로 반복 가능)
- 모양: 같은 벨벳의 위 덮개, 아래에 금색 술과 작은 술방울

### H-04 칸막이 두 칸
- 파일: `booths.png` 1720×420
- 모양: 창호지 칸막이 두 칸이 나란히, 가운데 나무 기둥, 뒤에서 호박색 빛. 칸 안은 비움(목소리 글자 자리)

---

## 10. 베일하운 (city)

### I-01 지도 핀
- 파일: `pin-idle.png` `pin-active.png` 96×128
- 모양: 녹색 밀랍 도장 머리의 놋쇠 압정. active는 금빛

### I-02 가게 표식
- 파일: `pin-shop.png` 120×160, 작은 걸이 랜턴(진홍 빛)

### I-03 장소 이름표
- 파일: `place-label-idle.png` `place-label-active.png` 300×80, 작은 두루마리 띠

### I-04 장소 카드 틀 ★
- 파일: `place-card.png` 940×900, 위 340px는 투명 창(장소 그림 자리)

### I-05 (선택) 도시 지도 다시 그리기
- 파일: `atlas.png` 3344×1882 (불투명)
- 지금 지도(`assets/art/atlas.webp`)와 **같은 배치**(왼쪽 위 성문, 가운데 광장, 오른쪽 위 첨탑, 가운데를 가로지르는 운하, 오른쪽 아래 성채 주둔지, 아래 가운데 둥근 심연 구멍)를 원본 그림체로 다시 그림. 글자 없음

---

## 11. 시작 (start)

### J-01 모드 카드
- 파일: `mode-opening-idle.png` `mode-opening-selected.png`(가게 문에 막 내건 첫 간판과 종), `mode-free-idle.png` `mode-free-selected.png`(펼친 빈 공책과 깃펜) 각 1300×360
- 그림은 카드 오른쪽 40% 안에만, 왼쪽은 글자 자리로 어둡게 비움

### J-02 선택 표시
- 파일: `select-off.png` `select-on.png` 96×96, 놋쇠 고리 / 금빛 밀랍 점

### J-03 프롤로그 틀 ★
- 파일: `prologue-frame.png` 1400×400, 편지지 테두리, 모서리 여백 56px

### J-04 출력 견본 틀 ★
- 파일: `sample-frame.png` 1100×1500, 어두운 나무 틀 안쪽 투명, 모서리 여백 48px

---

## 12. (선택) 큰 그림 교체

지금 큰 그림 3장은 예전에 다른 그림체로 생성한 것입니다. 원본 그림체로 맞추려면 아래도 같이 주문합니다. 모두 불투명, 인물·글자 없음.

- `key-visual.png` 3344×1882: 입구·가게·시술실 배경. 왼쪽 45%는 글자 자리로 어둡게 비움. 오른쪽에 둥근 스테인드글라스 창, 녹색 벨벳 긴 의자, 향유병 세 개
- `perfumery.png` 3344×1882: 시술 안내 머리 그림. 밤의 조향실, 아래쪽 40%는 글자 자리로 어둡게

---

## 13. 검수 기준 (납품 전 확인)

- [ ] 참고 그림(인물·배경 원본)과 나란히 놓았을 때 같은 작가 그림으로 보임
- [ ] 투명 항목의 배경이 진짜 투명(체크무늬를 그린 것 아님)
- [ ] 상태별 파일이 모양·크기·위치 모두 같음
- [ ] ★ 항목: 모서리 장식이 지정 여백 안에 있고 변 무늬가 일정
- [ ] 한글 없음. 영문은 "글자 포함" 항목만, 글자 없는 판도 같이 납품
- [ ] 파일명·크기가 이 문서와 일치

납품 후 처리(사이트 쪽): WebP 변환, 9분할 테두리 적용, 글자 얹기, 결 지도 좌표 조정, 코드 도형 제거는 제가 합니다.
