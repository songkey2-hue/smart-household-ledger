# 🚀 GitHub 저장소 업로드 및 Vercel 3분 배포 가이드

본 매뉴얼은 실기평가 제출을 위해 **스마트 머니로그(가계부 앱)**을 GitHub에 올리고 Vercel을 통해 전 세계에 배포하는 전체 과정을 정리한 가이드입니다.

---

## Step 1. GitHub 새 저장소(Repository) 만들기
1. [GitHub](https://github.com)에 로그인합니다.
2. 우측 상단의 **`+`** 버튼을 누르고 **`New repository`**를 클릭합니다.
3. 설정값을 다음과 같이 입력합니다:
   - **Repository name**: `smart-household-ledger` (또는 원하는 이름)
   - **Public** 선택
   - 하단의 `Add a README file`, `Add .gitignore` 체크박스는 **모두 해제(체크 안 함)** 상태로 둡니다. (이미 로컬에 포함되어 있음)
4. 초록색 **`Create repository`** 버튼을 클릭합니다.

---

## Step 2. 로컬 프로젝트 파일 GitHub에 업로드하기
1. 방금 생성된 빈 GitHub 저장소 페이지의 안내 문구 중 **`uploading an existing file`** 링크를 클릭합니다.
2. 다운로드받은 `household_ledger_app` 폴더 내의 다음 파일들을 모두 선택하여 점선 박스 영역으로 드래그합니다:
   - `index.html`
   - `style.css`
   - `app.js`
   - `vercel.json`
   - `README.md`
   - `PRD.md`
   - `.gitignore`
   *(참고: `GEMINI.md`는 개발 지침용 파일이므로 함께 올려도 무방합니다.)*
3. 하단의 초록색 **`Commit changes`** 버튼을 클릭하여 업로드를 완료합니다.

---

## Step 3. Vercel에서 GitHub 연동 및 배포하기 (Deploy)
1. [Vercel](https://vercel.com)에 접속하여 **`Continue with GitHub`**로 로그인합니다. (무료 Hobby 플랜)
2. 메인 대시보드 우측 상단의 **`Add New...`** ➔ **`Project`**를 클릭합니다.
3. Import Git Repository 목록에서 방금 생성한 **`smart-household-ledger`** 저장소를 찾아 **`Import`** 버튼을 클릭합니다.
   *(처음 연동 시 GitHub 계정 권한 승인 창이 뜨면 `Install Vercel`을 클릭합니다.)*
4. 설정 화면(Configure Project)이 나오면 **아무것도 변경하지 않고** 바로 파란색 **`Deploy`** 버튼을 클릭합니다.
5. 10~20초 후 폭죽 애니메이션과 함께 **`Congratulations!`** 화면이 나타나면 배포 성공입니다!

---

## Step 4. 배포 완료 확인 및 제출
- 화면 가운데 미리보기 이미지나 **`Visit`** 버튼을 클릭하면 배포된 실서비스 URL이 열립니다.
  - 예: `https://smart-household-ledger-xxx.vercel.app`
- 이 URL과 GitHub 저장소 링크를 실기평가 결과물로 제출하시면 됩니다!
