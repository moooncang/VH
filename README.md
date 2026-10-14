# 골목 시술소 V4

판타지 작품 소개 사이트. 기존 V3 레이아웃과 CSS·JS를 교체한 정적 다중 페이지입니다.
공개 주소: https://moooncang.github.io/VH/

## 실행

Python 3.12 이상. 빌드에는 표준 라이브러리만 필요합니다.

```sh
python _build/build.py
python -m http.server 8766
```

## 수정 위치

- `_build/data.py`: 인물, 대사, 장소, 메뉴, 감정별 파일 범위와 외부 링크.
- `_build/atelier.py`: 입구부터 카르테까지 12페이지의 새로운 구성과 공용 셸.
- `_build/experience.js`: 메뉴, 갤러리, 필터, 노트, 향유, 지도, 커튼, 효과음과 전환.
- `assets/experience.css`: V4 전용 스타일. V2/V3 스타일은 로드하지 않습니다.
- `assets/experience.js`와 HTML: 생성 결과이므로 원본을 수정한 뒤 빌드합니다.
- `assets/ui/wordmark.webp`: 새 입구 타이틀. 1536×1024 RGBA, 원본 크기와 투명도 유지.
- `assets/ui/inventory-atlas.webp`: 조향실의 향유병에만 사용하는 V3 그림.
- `assets/art`: 이전에 생성한 공간 그림. V4에서 새로운 배경을 생성하지 않았습니다.
- `assets/fonts`: 자체 호스팅 서체와 라이선스. 제목 Gowun Batang, 본문 Pretendard Variable, 영문 Cormorant, 메모 Nanum Pen.
- `images/CS`: 공급된 인물 그림 455장. `images/B`: 배경 11장. 원본 파일과 변환 파일의 크기를 변경하지 않았습니다.
- `design/v4-wordmark.json`: 내장 image_gen으로 생성한 타이틀의 정확한 프롬프트와 출처.
- `qa/v4-report.json`: 실제 브라우저 점검 기록. 스크린샷은 로컬 `qa/v4/`에 저장됩니다.

## 기능

입구의 성인 확인, 전체 화면 방 메뉴, 접수대 메뉴·장부·소문, 다섯 인물의 가로 갤러리와 직원/손님 필터, 개별 카르테의 감정 10개 및 변형 10장, 이미지 확대, 결 지도, 조향 노트 3장, 향유·달아오름 선택, 커튼, 도시 파노라마와 지도, 개업/자유모드.

시간대 설정은 삭제했습니다. 낮·저녁·심야 버튼, T 키 동작, 저장, 조명 변경은 없습니다. 예전 `vh-time` 저장값은 제거만 합니다.

단축키: 1~6 방 이동, 7 또는 ESC 방 메뉴, M 효과음. 카르테에서 좌우 키는 표정, Q/E는 인물 이동. 도시에서는 위아래 키로 장소 이동. 입력 칸과 열린 모달에서는 페이지 단축키를 실행하지 않습니다.

`prefers-reduced-motion`에서는 장식 모션을 끕니다. 숨겨진 탭에서는 실행 중인 애니메이션과 BGM을 중지합니다. 효과음은 입력 이후에만 재생됩니다.

## 콘텐츠 설정

`CONFIG.MASA_URL`, `CONFIG.CRACK_URL`, `CONFIG.BGM`은 비어 있습니다. 실제 주소를 넣으면 같은 탭으로 연결됩니다. 예약과 프롤로그 역시 작가 입력 전까지 비워 둡니다. 임의의 설정이나 예약을 만들지 않습니다.

인물 코드 A 레이나 / B 네르 / C 세르피나 / D 이브레아 / E 카샤. `AP.webp` 등은 첫등장, 0~9 평소, 10~19 기쁨, 20~29 슬픔, 30~39 당황, 40~49 부끄러움, 50~59 분노, 60~69 유혹, 70~79 달아오름, 80~89 시술입니다. 후반 세 묶음은 카르테 안에서만 열립니다. 원본 변환 도구는 `tools/convert.py`에 있습니다.

## 검증

```sh
python tools/check.py
node --check assets/experience.js
```

브라우저 회귀 검증은 Codex 브라우저 도구로 수행했습니다. 예전 자동화 스크립트는 이전 DOM에 종속되어 제거했습니다. Figma 파일과 `design/`의 기존 SVG는 V2 기록이며 V4 화면과 동기화되지 않았습니다.
