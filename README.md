# 3분던전 — 웹 전투 프로토타입

외부 패키지 설치 없이 동작하는 HTML / CSS / JavaScript 게임입니다. `index.html`을 브라우저에서 열면 바로 플레이할 수 있습니다. 인터넷이 없어도 게임이 동작하며, 온라인 폰트를 못 받으면 시스템 글꼴로 표시합니다.

## 조작

- 방향키: 이동 및 바라보는 방향 변경
- Z: 전방 부채꼴 근접공격 (누르고 있으면 반복)
- X: 관통 검기, 재사용 5초
- C: 반경 250의 필살기, 기본 공격 계수의 12배 / 8초 공격력 +30% / 재사용 35초
- ESC: 일시정지. 창 전환 시 자동 일시정지

일반 3마리 → 엘리트 2마리 → 보스 1마리. 180초 제한. 붉은 범위는 적 공격 예고입니다. 보스는 HP 30% 이하에서 공격력·이동 속도가 오르고 광역 필살기를 사용합니다. 사망, 제한시간 종료, 클리어 후 재도전 가능합니다. 최고 클리어 시간은 브라우저 로컬에 저장됩니다.

## 어디서나 같은 프로젝트 작업하기

필수 도구는 Git과 웹 브라우저뿐입니다. 편집기는 VS Code를 권합니다. 빌드 및 npm 설치 단계가 없어 환경 차이가 작습니다.

1. GitHub에서 빈 **비공개 또는 공개** 저장소를 생성합니다. 웹 공개는 아래 Pages 조건을 확인합니다.
2. 현재 폴더에서 최초 한 번 실행합니다 (`YOUR_NAME`을 본인 계정으로 변경).

```powershell
git add .
git commit -m "Create playable dungeon prototype"
git branch -M main
git remote add origin https://github.com/YOUR_NAME/3-minute-dungeon.git
git push -u origin main
```

3. 다른 컴퓨터에서 저장소를 복제합니다.

```powershell
git clone https://github.com/YOUR_NAME/3-minute-dungeon.git
cd 3-minute-dungeon
```

4. 매번 작업 시작 전 `git pull --ff-only`, 작업 종료 시 아래를 실행합니다.

```powershell
git add .
git commit -m "Describe your change"
git push
```

5. 집에서 수정·푸시 → 회사에서 pull → 동일 화면 확인 → 작은 수정·푸시 → 집에서 pull 순서로 왕복하면 환경 통일을 검증할 수 있습니다. 충돌이 나면 덮어쓰지 말고 변경 내용을 확인하세요.

## 링크로 공유하기

GitHub 저장소 Settings → Pages → Deploy from a branch → main / root → Save. 배포가 끝나면 표시된 URL로 접속합니다. GitHub Free에서는 공개 저장소로 Pages를 사용할 수 있으며 비공개 저장소 지원은 요금제를 확인하세요. 현재 저장소 원격 연결이나 온라인 배포는 아직 수행하지 않았습니다.

## 파일과 밸런스

- `index.html`: 화면 및 안내
- `style.css`: 레이아웃과 디자인
- `game.js`: 전투 / `CONFIG`의 용사 및 몬스터 스탯
- `BALANCE.md`: 수치와 목표 전투 시간

실제 타격 성공률·회피·스킬 사용에 따라 클리어 시간은 달라집니다. 90초는 검증 전 목표이며 웨이브 시간을 강제로 맞추지 않습니다. 일일 제한, 계정, 서버, 온라인 랭킹, 터치 조작은 후속 범위입니다.
