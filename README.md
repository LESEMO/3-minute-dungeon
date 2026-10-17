# 3분던전 — 웹 전투 프로토타입

외부 패키지 설치 없이 동작하는 HTML / CSS / JavaScript 게임입니다. `index.html`을 브라우저에서 열면 바로 플레이할 수 있습니다. 인터넷이 없어도 게임이 동작하며, 온라인 폰트를 못 받으면 시스템 글꼴로 표시합니다.

## 조작

- 방향키: 이동 및 바라보는 방향 변경
- Z: 3연타 (누르고 있으면 1→2→3타 반복). 1타: 좁은 부채꼴, 피해 85%, 간격 0.2초. 2타: 기존 부채꼴, 피해 100%, 간격 0.3초. 3타: 전방 70 지점에서 반지름 80까지 0.5초간 원형 확산, 피해 125%, 간격 0.5초. 마지막 공격 후 1초가 지나면 1타로 초기화됩니다.
- X: 관통 검기, 재사용 5초
- C: 반경 250의 필살기, 기본 공격 계수의 12배 / 8초 공격력 +30% / 재사용 35초
- ESC: 일시정지. 창 전환 시 자동 일시정지
- Z/X/C 공격 직후 0.1초 동안 이동할 수 없습니다. 방향 전환은 가능합니다.
- 적 몸에 닿으면 적 공격력의 50%에서 용사 방어력을 뺀 피해(최소 1)를 받고, 겹침을 해소한 뒤 18만큼 밀려납니다. 피격 후 0.65초 무적이며 무적 중 접촉 피해·밀려남은 반복되지 않습니다.

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

GitHub 저장소 Settings → Pages → Deploy from a branch → main / root → Save. 배포가 끝나면 표시된 URL로 접속합니다. GitHub Free에서는 공개 저장소로 Pages를 사용할 수 있으며 비공개 저장소 지원은 요금제를 확인하세요. 현재 원격 저장소는 `https://github.com/LESEMO/3-minute-dungeon.git`로 연결되어 있습니다. 온라인 배포 여부는 아직 확인하지 않았습니다.

## Codex와 여러 PC에서 이어서 작업하기

채팅을 다시 설명하는 대신 `AGENTS.md`에 작업 규칙, `PROJECT_STATUS.md`에 프로젝트 상태와 결정을 보관합니다. 두 파일도 코드처럼 커밋·푸시해야 다른 PC에서 읽을 수 있습니다. Git으로 공유되는 것은 저장소 파일입니다. 채팅 이력, 로그인, 로컬 설치 도구와 게임 최고 기록이 함께 복사되는 것은 아닙니다.

참고한 [여러 PC에서 Codex 작업 이어가기 글](https://note.com/hatuo_0501/n/n09d12a15cfad?hl=ko)처럼, 필요한 결론을 Markdown에 남기고 코드와 함께 전달합니다. 글의 PROJECT.md / HANDOVER.md / TODO.md 역할은 이 프로젝트에서는 `PROJECT_STATUS.md` 한 파일에 통합했습니다. 맨 위의 **바로 이어받기**만 보면 중단 지점과 다음 첫 행동을 빠르게 확인할 수 있습니다.

### 다른 PC에서 최초 한 번

1. Git과 사용할 Codex를 설치하고 각각 로그인합니다. 개인 저장소에 접근 가능한 GitHub 계정을 사용합니다.
2. 터미널에서 프로젝트를 보관할 상위 폴더로 이동해 실행합니다. 이미 clone한 폴더라면 다시 clone하지 말고 다음 절차로 갑니다.

```powershell
git clone https://github.com/LESEMO/3-minute-dungeon.git
cd 3-minute-dungeon
git config user.name "본인 이름"
git config user.email "본인 GitHub 이메일 또는 noreply 이메일"
```

3. Codex에서 이 **로컬 프로젝트 폴더**를 열고 그 폴더를 대상으로 채팅을 시작합니다. 원래 PC의 경로와 같을 필요는 없습니다.
4. 아래 시작 프롬프트를 보냅니다.

### 매번 작업 시작할 때 — Codex에 보낼 말

```text
이 폴더는 GitHub LESEMO/3-minute-dungeon의 3분던전 프로젝트야.
AGENTS.md를 읽고 git status와 현재 브랜치를 확인해줘.
미커밋 변경이 없으면 git pull --ff-only로 최신화하고,
최신 PROJECT_STATUS.md, README.md, 필요하면 BALANCE.md를 읽어줘.
PROJECT_STATUS.md의 '바로 이어받기'를 기준으로 중단 지점과 다음 첫 행동을 확인해줘.
변경이 남아 있거나 충돌·분기가 있으면 작업을 보존하고 상황을 알려줘.
완료된 것, 미완료인 것, 다음 작업을 간단히 설명해줘. 아직 게임 수정은 하지 마.
```

상태 설명을 받은 뒤 구체적인 요청을 보냅니다. 예:

```text
이번에는 보스 체력을 2200에서 2000으로 낮춰줘.
관련 설명 수치도 맞추고 필요한 검증을 한 뒤 PROJECT_STATUS.md에 기록해줘.
```

### 매번 작업 끝낼 때 — Codex에 보낼 말

```text
오늘 작업을 마무리해줘. 변경 내용과 검증 결과, 미완료 사항, 다음 할 일을
PROJECT_STATUS.md에 반영하고 관련 문서도 맞춰줘.
'바로 이어받기'에는 진행 중인 일의 중단 지점, 미해결 문제,
다음 첫 행동과 완료 기준, 의도적으로 보류한 내용을 짧게 갱신해줘.
git diff와 status를 확인해 이번 작업의 코드와 관리 파일을 함께 커밋하고
현재 브랜치를 origin에 푸시해줘. 다른 작업의 변경이 섞여 있으면 분리해줘.
커밋 해시와 푸시 성공 여부를 알려줘. 실패하면 원인과 남은 조치를 알려줘.
```

푸시 성공 보고까지 확인하고 PC를 옮깁니다. 인증이나 실행 권한 승인이 필요하면 해당 PC에서 처리합니다. Codex에게 Git 작업을 맡기지 않는다면 문서 갱신 후 터미널에서 직접 실행합니다.

```powershell
git status
git diff
git add AGENTS.md PROJECT_STATUS.md README.md
# 게임 파일을 수정했다면 해당 파일도 git add로 포함합니다.
git commit -m "Document project handoff workflow"
git push
```

### PC 간 왕복 확인

- PC A: 위 종료 프롬프트로 관리 파일까지 푸시.
- PC B: clone/pull 후 시작 프롬프트로 프로젝트 내용을 제대로 설명하는지 확인.
- PC B: 화면 문구 하나를 바꾸고 실행 확인 후 종료 프롬프트로 푸시.
- PC A: 시작 프롬프트로 pull 후 코드와 PROJECT_STATUS.md 양쪽의 변경 확인.
- 두 PC에서 같은 파일을 동시에 수정하는 대신 한쪽 작업을 푸시한 뒤 다른 쪽에서 받습니다.

## 파일과 밸런스

- `index.html`: 화면 및 안내
- `style.css`: 레이아웃과 디자인
- `game.js`: 전투 / `CONFIG`의 용사 및 몬스터 스탯
- `BALANCE.md`: 수치와 목표 전투 시간

실제 타격 성공률·회피·스킬 사용에 따라 클리어 시간은 달라집니다. 90초는 검증 전 목표이며 웨이브 시간을 강제로 맞추지 않습니다. 일일 제한, 계정, 서버, 온라인 랭킹, 터치 조작은 후속 범위입니다.
