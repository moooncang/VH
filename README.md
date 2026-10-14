# 골목 시술소 V5

공개 사이트: https://moooncang.github.io/VH/

정적 HTML/CSS/JavaScript 사이트입니다. 일레온의 실제 입장·메인·인물 화면과 FF XVI, Expedition 33 공식 사이트를 확인하고 화면 구성과 이동 방식을 다시 설계했습니다.

## 실행과 수정

```sh
python _build/build.py
python -m http.server 8766
```

- `_build/data.py`: 사용자 제공 설정, 인물, 대사, 파일 범위, 외부 링크.
- `_build/cinema.py`: 12개 페이지 구성과 공용 메뉴.
- `_build/cinema.js`: 화면 전환, 인물 선택, 표정, 안내, 커튼, 복사, 모션.
- `assets/cinema.css`: V5 스타일. 이전 버전 스타일은 삭제했습니다.
- HTML과 `assets/cinema.js`는 생성물이므로 원본 수정 후 빌드합니다.
- `images/CS` 인물 455장, `images/B` 배경 11장의 파일과 크기는 그대로 유지했습니다.
- `assets/art/title-v5.webp`: 새 공간 키 비주얼. 원본 픽셀 크기 그대로 WebP로 변환.
- `design/v5-key-visual.json`: 생성 도구·원본 위치·정확한 프롬프트.
- `assets/fonts/hahmlet`: 일레온에서도 쓰는 Hahmlet. SIL OFL 라이선스 포함.
- `qa/v5-report.json`: 브라우저 검수 기록. 화면 캡처는 로컬 `qa/v5/`.

## 콘텐츠 연결

`CONFIG.MASA_URL`, `CONFIG.CRACK_URL`, `CONFIG.BGM`은 아직 빈 값입니다. 실제 주소·파일 경로를 넣으면 활성화됩니다. 예약과 프롤로그도 사용자 입력 전까지 빈 상태로 표시합니다.

인물 코드 A 레이나 / B 네르 / C 세르피나 / D 이브레아 / E 카샤. 첫등장 파일은 AP~EP.webp, 감정 파일 범위는 `_build/data.py`의 `EXPRESSION_GROUPS`를 따릅니다. 그림 교체 시 같은 파일명과 원본 비율을 유지하세요. 변환 도구는 `tools/convert.py`입니다.

## 동작

상단 직접 이동, 모바일 전체 메뉴, 메인 목적지 미리보기, 다섯 인물의 즉시 전환, 감정 10묶음, 이미지 확대, 결 지도, 시술 안내 3장, 향유, 도시 파노라마, 커튼, 개업·자유모드 복사.

시간 설정은 없습니다. T 단축키, 시간대 저장·읽기, 조명 변경을 제거했습니다. 이전 `vh-time` 값은 정리만 합니다.

1~6 페이지 이동, ESC/7 메뉴, M 효과음. 인물 선택은 좌우, 상세 인물은 좌우 표정·Q/E 인물, 도시는 위아래 장소. 입력 및 열린 모달에서는 페이지 단축키가 동작하지 않습니다.

모션 감소 설정에서는 제목 진입·파티클·패럴랙스·전환을 중지합니다. 탭을 숨기면 실행 모션·음악을 멈춥니다. 효과음은 사용자 입력 뒤에만 재생합니다.

## 검증

```sh
python tools/check.py
node --check assets/cinema.js
```

브라우저에서 1440×900 / 390×844 전체 페이지, 추가 320 / 768 / 1280 폭을 확인했습니다. 포인터 hover 자체는 자동화 API가 없어 동일한 미리보기 콜백의 키보드 경로와 CSS를 확인했습니다. OS의 모션 감소 설정은 변경하지 않았으며 구현을 소스에서 검수했습니다.

Figma의 기존 파일은 이전 버전 기록입니다. V5를 Figma에서 제작·동기화했다고 주장하지 않습니다.
