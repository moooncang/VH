# 골목 시술소 V7

공개 사이트: https://moooncang.github.io/VH/

정적 HTML/CSS/JavaScript 사이트입니다. 빌드 도구 없이 python 스크립트 하나로 12개 페이지를 생성합니다.

## 실행과 수정

```sh
python _build/build.py
python -m http.server 8766
```

- `_build/data.py`: 작품 설정, 인물, 대사, 소문, 장소, 파일 범위, 외부 링크. 문구 수정은 여기서 합니다.
  - 파일 끝 V6 블록: 인물 영문 표기(`EN_NAMES`), 초상 속 얼굴 좌표(`FACES`, 썸네일 자르기 기준), 지도 표식 좌표(장소 `x`·`y`, `SHOP_PIN`).
- `_build/pages.py`: 페이지 구성과 공용 머리·메뉴·바닥글.
- `_build/site.js`: 동작 원본. 빌드 시 `assets/site.js`로 복사됩니다.
- `assets/site.css`: 스타일. 색·서체 토큰은 파일 맨 위 `:root`, 그림 에셋을 입히는 층은 파일 끝 `SKIN` 구역입니다.
- `assets/skin/`: 버튼·팻말·종이·액자·커튼 등 UI 그림(WebP). `tools/skin.py`가 `design/incoming/`의 원본 PNG를 잘라 변환합니다. 원본을 바꾸면 `python tools/skin.py` 후 빌드합니다.
- `design/ui-asset-order.md`: UI 그림 납품요구서(파일명·크기·상태). 다시 주문할 때 이 문서를 씁니다.
- HTML과 `assets/site.js`는 생성물이므로 원본을 고친 뒤 빌드합니다.

## 사운드트랙 (assets/ost/)

곡 목록과 방 배정은 `_build/data.py`의 `OST`입니다. 가게 = Morning in the Back Alley, 시술 안내 = Perfumery Afternoon, 시술실 = Steam and Sheet Rustle, 인물·카르테·베일하운·시작 = Untie Me. 입구 화면은 조용합니다. 같은 곡이 이어지는 방끼리는 이어서 재생하고, 곡이 바뀔 때는 서서히 줄였다 키웁니다. 가게 페이지 Soundtrack에서 곡을 누르면 모든 방에서 그 곡으로 고정되고, "방마다 바뀌는 음악으로"로 되돌립니다. 머리의 스피커 버튼(M 키)이 음악과 효과음을 함께 켜고 끕니다. 곡을 추가하려면 `<이름>.mp3`와 표지 `<이름>.webp`(16:9)를 넣고 `OST`에 한 줄 추가합니다.

## 시술 체험 (masa/)

`masa/`는 별도로 만든 레이나 마사지 체험(PixiJS)입니다. 시술실 페이지에서 커튼을 열면 나오는 "시술 체험하기"(`CONFIG.MASA_URL`)로 들어갑니다. 빌드 스크립트가 만들지 않는 독립 페이지라 `masa/index.html`을 직접 수정합니다. 사이트 연동으로 바꾼 곳은 세 군데입니다: 성인 확인(`../assets/guard.js`), 오른쪽 위 시술실 복귀 버튼(`#leave`), 결과 화면 "시술실로" 버튼(`#resultLeave`). 글꼴은 Google Fonts에서 불러옵니다.

## 콘텐츠 연결

`CONFIG.CRACK_URL`(작품으로 들어가기), `CONFIG.PROLOGUES`, `CONFIG.RESERVATIONS`는 아직 빈 값입니다. 채우면 해당 자리가 자동으로 활성화되고, 비어 있는 동안은 "준비 중"으로 표시됩니다.

## 그림

- 인물 코드 A 레이나 / B 네르 / C 세르피나 / D 이브레아 / E 카샤. 첫등장 `AP~EP.webp`(1600×1103), 표정 `{코드}_{번호}.webp`(1600×667, 시술 묶음 1536×1536). 감정 묶음 범위는 `EXPRESSION_GROUPS`.
- 배경 `images/B/*.webp` 2048×300 파노라마. 도시 페이지 장소 카드와 시작 페이지에 쓰입니다.
- `assets/art/`: 키 비주얼(key-visual), 조향실(perfumery), 도시 지도(atlas). 모두 2400×1351, `tools/skin.py`가 생성합니다.
- 결 지도 좌표(`KNOT_MAP`)는 `assets/skin/body-front.webp`·`body-back.webp` 마네킹 기준 퍼센트, 지도 표식(`PLACES`의 x·y, `SHOP_PIN`)은 `atlas.webp` 기준 퍼센트입니다. 그림을 바꾸면 이 좌표도 맞춰 주세요.
- 교체 시 같은 파일명과 비율을 유지하세요. 첫등장 그림을 바꾸면 `FACES` 좌표도 맞춰 주세요. 변환 도구는 `tools/convert.py`입니다.

## 동작

입구 벨(입장 시 효과음·BGM 시작), 방 안내 메뉴, 골목 소문 흐름 띠와 소문 창, 칸막이 너머 목소리, 인물 즉시 전환과 관계도, 인물 카르테(표정 10묶음·변형 필름, 결 지도, 허용선, 반응, 대사), 시술 안내 목차 추적·깊이·달아오름 조절·향유 선반, 시술실 커튼, 도시 지도 표식, 시작 모드와 출발 상태 복사.

단축키: 1~6 페이지 이동, ESC 방 안내, M 효과음. 인물 페이지 좌우, 카르테 좌우(변형)·Q/E(인물), 도시 위아래(장소). 입력 중이거나 창이 열려 있으면 페이지 단축키는 동작하지 않습니다.

모션 감소 설정에서는 진입 연출·빛 입자·패럴랙스·전환을 끕니다. 탭을 숨기면 모션과 음악을 멈춥니다.

## 검증

글자 잘림·겹침·크기·대비는 `tools/text-audit/`로 전 페이지를 6가지 폭에서 검사합니다(사용법은 그 폴더의 README).

```sh
python tools/check.py
node --check assets/site.js
```

자원 경로, 중복 id, 금지 대시, 서체 파일, CSS가 참조하는 모든 그림 파일을 검사합니다. 브라우저에서 1440×900, 390×844 전체 페이지와 커튼·메뉴·소문·표정·인물 전환·지도 선택 상태를 확인했습니다.
