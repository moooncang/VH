# 글자 검사 (text audit)

모든 페이지·상태(인물 5명, 카르테 5장, 장소 6곳, 커튼, 메뉴, 소문, 자유모드)를 6가지 폭(1440·1280·1024·768·390·360)에서 열어 글자마다 검사합니다.

- 잘림: 부모 영역에 잘리는 글자, 그림 카드(카르테·인물 카드 등) 밖으로 넘치는 글자, 화면 밖으로 나간 글자
- 겹침: 다른 글자와 겹친 글자
- 크기: 11.5px 미만
- 대비: 화면 캡처에서 글자 뒤 실제 배경색을 재서 4.5:1(큰 글자 3:1) 미만

```sh
python -m http.server 8766 &
for w in 1440x900 1280x800 1024x768 768x1024 390x844 360x740; do node tools/text-audit/collect.js /tmp/audit $w & done; wait
python tools/text-audit/analyze.py /tmp/audit
```

남아 있어도 되는 항목: `guide-toc overflow-box`, `chapter-en ancestor-clip`(가로로만 자르는 구역의 세로 여백), 휴대폰 카르테 `k-name`·`k-head`(큰 글자의 글꼴 상자가 줄 높이보다 큰 것). 실제 화면에서는 잘리지 않습니다.
