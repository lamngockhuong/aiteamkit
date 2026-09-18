# Tổng hợp mã nguồn

Bản tra cứu từng file đang được quản lý trong repo. Tài liệu này lỗi thời ngay khi có file được
thêm, xóa hoặc đổi tên; hãy cập nhật trong cùng commit đó.

## Thư mục gốc

| File | Mục đích |
|------|----------|
| `README.md` | Điểm vào công khai: sơ đồ vòng đời, bảng 19 skill, khối invocation, quy ước output, hướng dẫn cài đặt |
| `CLAUDE.md` | Hướng dẫn cho người bảo trì: tiền đề về team, bố cục ba manifest, giải phẫu skill, nguyên tắc DRY của `shared/`, danh sách file phải đồng bộ chéo, chính sách em-dash, quy trình release, lệnh kiểm tra |
| `LICENSE` | MIT |
| `package.json` | `private: true`, không có scripts; tồn tại để mang version và metadata repo |
| `release-please-config.json` | Tự động hóa release: kiểu `simple`, các cờ bump tiền 1.0, và năm `extra-files` mang version |
| `.release-please-manifest.json` | File trạng thái của release-please giữ version hiện tại. Không bao giờ sửa tay |
| `.gitignore` | Rác của macOS, Python, Node |

## Manifest

| File | Mục đích |
|------|----------|
| `.claude-plugin/plugin.json` | Metadata plugin cho Claude Code. Không có khóa `skills`: Claude tự quét `skills/` |
| `.claude-plugin/marketplace.json` | Mục marketplace của Claude Code, trỏ về `./` |
| `.cursor-plugin/plugin.json` | Metadata cho Cursor, có `displayName` và `"skills": "./skills/"` |
| `.codex-plugin/plugin.json` | Metadata cho Codex CLI, có `"skills": "./skills/"` cộng khối `interface{}`: mô tả, `defaultPrompt`, `brandColor`, đường dẫn icon |

## Lớp dùng chung

| File | Mục đích |
|------|----------|
| `shared/team-roles.md` | Bảng vai trò (PM, BrSE/BA, TL, Dev, QA, SRE, Stakeholder) và sáu nguyên tắc mọi skill tuân theo: chỉ tên người chứ không chỉ tên team, tách người viết khỏi người duyệt, không quyết thay vai trò sở hữu, viết cho người vắng mặt, chỉ hỏi thứ repo không trả lời được, theo ngôn ngữ làm việc của team |
| `shared/artifact-paths.md` | Cách xác định thư mục docs gốc, đường dẫn output mặc định theo skill, quy tắc đặt tên `YYMMDD`, bảng các loại tài liệu tham chiếu, ba nhóm độ bền và nhóm nào được commit, cách đánh số ADR, khối front matter dùng chung, và nguyên tắc không ghi đè bản ghi đã `APPROVED` |
| `shared/ticket-adapters.md` | Thứ tự phát hiện tracker, bảng ánh xạ từ vựng atk sang GitHub Issues, Jira, Backlog và Redmine, các lệnh đẩy bằng `gh`, và quy tắc liên kết hai chiều |
| `shared/review-checklist.md` | Định dạng bản ghi quy tắc `CONV-NNN` mà `convention` viết ra và `review` trích dẫn, vai trò của từng skill với nó, tám mục nền kèm mức nghiêm trọng mặc định, và quy tắc loại bỏ quy tắc đã cũ. `convention` và `review` trích dẫn, còn `implement` chỉ lấy phần mục nền |
| `shared/project-profile.md` | Nội dung của `.atk/profile.md` trong dự án đích, lý do nó nằm ở đó chứ không nằm trong kit, và quy tắc ba nhóm quyết định skill nào dừng, skill nào giảm chất lượng, skill nào bỏ qua khi thiếu profile |
| `shared/finalize-steps.md` | Trình tự khép lại một thay đổi mã nguồn: tài liệu tham chiếu mà thay đổi đó mắc nợ, nhánh, commit, và ranh giới xin phép mà mọi hành động sau commit phải vượt qua. `fix`, `implement` và `verify` trích dẫn |
| `shared/layer-verification.md` | Bảng năm tầng: chạy gì cho một tầng, một lượt đạt chứng minh được gì, và không chứng minh được gì. `fix`, `implement` và `verify` trích dẫn, để cả ba nói cùng một điều về cùng một kết quả |
| `shared/diagram-conventions.md` | Khi nào một sơ đồ xứng đáng có mặt trong artifact, bốn dạng hình kit vẽ (luồng duyệt, đồ thị phụ thuộc, sequence, chuỗi nhân quả), và các quy tắc giữ cho chúng dễ đọc: chỉ Mermaid, xuống dòng bằng `<br/>` chứ không bằng ký tự xuống dòng thô, gọi vai trò thay vì gọi tên người, hình thoi nào cũng có đủ hai nhánh, không đặt màu nền cứng. `catchup`, `design-doc`, `plan`, `breakdown` và `incident` trích dẫn |
| `shared/host-capabilities.md` | Skill được dùng những khả năng nào của agent chủ và gọi tên chúng ra sao, nguyên tắc vẫn cấm gọi tên lệnh của một kit khác, cách xử lý trên harness không có khả năng đó, bốn quy tắc của bước dọn mã, và phần chính sách chặn trên số lượt review song song. `fix`, `implement`, `verify` và `review` trích dẫn |
| `shared/spec-docs.md` | Điều tách một tài liệu tham chiếu khỏi một tài liệu thiết kế, nguyên tắc hình dạng tài liệu sẵn có của dự án thắng template của kit, năm loại thay đổi buộc pull request phải mang theo tài liệu tham chiếu, và ranh giới giữa chỗ lệch với câu hỏi chưa ai trả lời. `spec`, `design-doc`, `implement`, `fix`, `verify` và `review` trích dẫn |
| `shared/tidy-pass.md` | Nội dung của bước dọn mã: ba lăng kính (tái dùng, sáng rõ, hiệu năng), phần được sửa, phần không bao giờ đụng, và những gì phải soi lại trong diff sau đó. `fix`, `implement` và `verify` trích dẫn thông qua `host-capabilities.md`, và đây là lý do kit không có skill `simplify` |

## Hook

| File | Mục đích |
|------|----------|
| `hooks/hooks.json` | Đăng ký một hook `SessionStart` cho Claude Code, ở dạng exec nên không nền nào dùng tới shell: `"command": "node"` cộng `${CLAUDE_PLUGIN_ROOT}` trong `args` |
| `hooks/check-profile.mjs` | Node ESM, nên cư xử như nhau trên Linux, macOS và Windows. In một lời nhắc khi một repo git chưa có `.atk/profile.md`, mỗi dự án một lần, và thoát 0 ở mọi nhánh. Không chặn, không ghi gì vào repo của người dùng. Codex và Cursor chưa có lớp vỏ riêng |

## Các skill

Mỗi skill là một `SKILL.md`. Bảy skill có thêm `references/` và `evals/`. Riêng `review` chỉ
có `references/`; mười một skill gốc còn lại thì chưa có gì thêm.

| File | Chặng | Sinh ra |
|------|-------|---------|
| `skills/init/SKILL.md` | Khởi tạo | `.atk/profile.md`: lệnh, tầng, thư mục docs, tracker, team, và cách kiểm chứng lúc chạy |
| `skills/intake/SKILL.md` | Yêu cầu | User story, tiêu chí nghiệm thu, ngoài phạm vi, câu hỏi treo có người phụ trách |
| `skills/catchup/SKILL.md` | Yêu cầu | Bản tóm tắt cho người không có mặt trong cuộc hội thoại, kèm phần tự kiểm hiểu bài cho epic |
| `skills/estimate/SKILL.md` | Lập kế hoạch | Ước lượng có căn cứ và độ tin cậy, capacity, cam kết sprint, phần dư |
| `skills/design-doc/SKILL.md` | Thiết kế | Tài liệu thiết kế có so sánh phương án, kèm ADR |
| `skills/spec/SKILL.md` | Thiết kế | Tài liệu tham chiếu cho API, schema và tính năng, ghi đè tại chỗ, kèm chế độ dò lệch |
| `skills/breakdown/SKILL.md` | Lập kế hoạch | Task có người nhận, đồ thị phụ thuộc, làn song song kèm quyền sở hữu file |
| `skills/convention/SKILL.md` | Phát triển | Quy ước team phân loại enforced / reviewed / aspirational |
| `skills/plan/SKILL.md` | Phát triển | Phase kết thúc bằng thứ đem duyệt được, bước giữ cây mã chạy được, ranh giới phạm vi |
| `skills/implement/SKILL.md` | Phát triển | Mã nguồn, kiểm chứng theo tầng, kèm bản ghi trở thành phần mô tả pull request |
| `skills/fix/SKILL.md` | Phát triển | Nguyên nhân đã chứng minh, thay đổi nhỏ nhất gỡ được nó, và báo cáo đã kiểm những gì |
| `skills/review/SKILL.md` | Phát triển | Phát hiện xếp hạng blocking / should fix / nit, có thể đăng lên PR |
| `skills/qa/SKILL.md` | Kiểm thử | Test plan, test case có truy vết, ma trận regression, tiêu chí vào và ra |
| `skills/verify/SKILL.md` | Kiểm thử | Hệ thống chạy thật, khẳng định tác động trong dữ liệu, báo lên người có tên sau ba vòng |
| `skills/release/SKILL.md` | Bàn giao | Ghi chú theo đối tượng, checklist có người phụ trách, migration, rollback, phê duyệt |
| `skills/incident/SKILL.md` | Vận hành | Timeline, nguyên nhân gốc có bằng chứng, postmortem, hành động, runbook |
| `skills/retro/SKILL.md` | Cải tiến | Kiểm chứng hành động cũ, bằng chứng sprint, ba hành động mới, báo cáo |
| `skills/onboard/SKILL.md` | Con người | Cài đặt đã kiểm chứng, danh sách quyền, bản đồ code, tuần đầu kết thúc bằng một merge |
| `skills/handover/SKILL.md` | Con người | Trạng thái thật của việc dở, quyết định, bẫy, chuyển giao quyền, người nhận ký |

### Thư mục `references/`

Chỉ được nạp khi một bước trong workflow mở ra, nên chúng nằm ngoài ngữ cảnh mặc định.

| File | Mục đích |
|------|----------|
| `skills/init/references/detection.md` | Tìm từng trường của profile ở đâu, và làm gì khi repo cho nhiều đáp án hoặc không cho đáp án nào |
| `skills/init/references/profile-template.md` | Bố cục của `.atk/profile.md` mà `init` điền vào |
| `skills/catchup/references/brief-template.md` | Một khung chung cho hai chế độ, phần khác nhau giữa epic và pull request được đánh dấu theo từng mục |
| `skills/catchup/references/understanding-check.md` | Bộ câu hỏi cố định, bảng phân loại kiểu tính năng, và hai quy tắc quyết định phần tự kiểm có giá trị hay không |
| `skills/plan/references/step-ordering.md` | Hai lần cắt, theo phase và theo bước, mỗi lần một quy tắc riêng |
| `skills/plan/references/plan-template.md` | Trang chỉ mục của kế hoạch và một file phase |
| `skills/implement/references/plan-gate.md` | Ba mức quyết định một phần việc cần bao nhiêu đồng thuận trước khi viết dòng mã đầu tiên |
| `skills/implement/references/verification.md` | Thứ tự chạy các phép kiểm, phạm vi cần với tới, và lúc nào dừng |
| `skills/implement/references/review-fix-loop.md` | Vòng gọi review team lên chính output của skill, và trần chặn vòng lặp che đi một vấn đề thiết kế |
| `skills/fix/references/investigate.md` | Chứng minh nguyên nhân, kiểm xem hành vi hiện tại có phải chủ ý, và cổng quyết định có được sửa hay không |
| `skills/fix/references/layer-playbooks.md` | Theo từng tầng: nguyên nhân thường nấp ở đâu, tái hiện thế nào, và xác nhận nó đã hết ra sao |
| `skills/fix/references/report-template.md` | Báo cáo sửa lỗi, viết cho người review phải kiểm lại một khẳng định chứ không phải tin vào nó |
| `skills/spec/references/api-spec-template.md` | Hình dạng tài liệu API cho thư mục còn trống: bảng kiểu xử lý đặt trước, rồi mỗi endpoint một khối |
| `skills/spec/references/db-spec-template.md` | Hình dạng tài liệu bảng: cột, khóa, vòng đời một hàng, luật truy cập |
| `skills/spec/references/feature-spec-template.md` | Hình dạng tài liệu tính năng: lối vào gồm cả job, hành vi theo điều kiện, quyền theo vai trò |
| `skills/spec/references/drift-check.md` | Bảng kiểm phủ, hình dạng một phát hiện, ba mức nghiêm trọng, và ranh giới chỉ đọc |
| `skills/review/references/parallel-review.md` | Bảng chọn số lượt review và trần bộ nhớ chặn nó, mỗi người review được đưa những gì, và cách gộp nhiều lượt thành một danh sách xếp hạng |
| `skills/verify/references/runtime-checks.md` | Dựng ứng dụng lên, tác động vào nó, khẳng định một tác động thật, và dọn dẹp sau đó |
| `skills/verify/references/ui-checks.md` | Lượt chạy `--ui`: đối chiếu màn hình với bản thiết kế |
| `skills/verify/references/report-template.md` | Báo cáo kiểm chứng, nêu rõ đã chứng minh được gì và chưa chứng minh được gì |

### Thư mục `evals/`

Mỗi file là một mảng `{query, should_trigger}` kiểm phần `description` của skill. Chưa có bộ chạy;
xem phase 4 trong `docs/vi/project-roadmap.md`.

| File | Mục đích |
|------|----------|
| `skills/init/evals/trigger_evals.json` | Cách nói về khởi tạo, đối lại những yêu cầu cấu hình dự án không thuộc `init` |
| `skills/catchup/evals/trigger_evals.json` | Nắm bắt việc đang chạy, đối lại `intake` và `onboard` |
| `skills/plan/evals/trigger_evals.json` | Lập kế hoạch cho một người, đối lại `breakdown` và `design-doc` |
| `skills/spec/evals/trigger_evals.json` | Tài liệu tham chiếu, đối lại `design-doc`, `intake` và việc sinh mã |
| `skills/implement/evals/trigger_evals.json` | Làm việc xây dựng, đối lại lập kế hoạch và review |
| `skills/fix/evals/trigger_evals.json` | Một lỗi, đối lại `incident` và việc triển khai thông thường |
| `skills/verify/evals/trigger_evals.json` | Kiểm chứng lúc chạy, đối lại `qa` và `review` |

## Assets

| File | Mục đích |
|------|----------|
| `assets/atk-icon.svg` | Icon vuông, hai hình người trên nền xanh bo góc. `.codex-plugin` dùng làm `composerIcon` |
| `assets/atk-logo.svg` | Logo ngang, icon cộng chữ. `.codex-plugin` dùng làm `logo` |

## Tài liệu

Bản tiếng Anh là nguồn sự thật; `docs/vi/` mirror theo từng file.

| File | Mục đích |
|------|----------|
| `docs/project-overview-pdr.md` | atk là gì, những kiểu hỏng quy trình nó nhắm tới, mục tiêu, phi mục tiêu, đối tượng, tiêu chí thành công |
| `docs/system-architecture.md` | Một cây nội dung ba manifest, mô hình nạp và ngân sách kích thước, lớp `shared/`, giải phẫu skill, luồng dữ liệu lúc chạy |
| `docs/skills-overview.md` | Theo từng skill: sinh ra gì, khi nào dùng, khi nào không, và thói quen làm nên khác biệt |
| `docs/artifact-lifecycle.md` | Artifact nào nên commit, cái nào được phép xóa, xóa mỗi loại thì mất gì, và ba chính sách một đội có thể chọn |
| `docs/codebase-summary.md` | Chính là file này |
| `docs/project-roadmap.md` | Kế hoạch theo phase và trạng thái |
| `docs/flow/project-flow.md` | 19 skill đặt vào các pha bàn giao, kèm người viết và người duyệt từng artifact, và vòng quay lại khi artifact bị trả về |
| `docs/flow/skill-chain.md` | Chuỗi artifact: mỗi skill đọc gì, để lại gì, skill nào nhặt tiếp, và ba chỗ chuỗi hay đứt |
| `docs/flow/skill-lifecycle.md` | Bên trong một skill: chín mục mà `SKILL.md` nào cũng có, năm chặng của một lượt chạy, và năm loại quan hệ giữa các skill, trong đó chỉ bốn loại xảy ra lúc chạy |
| `docs/vi/**/*.md` | Bản tiếng Việt mirror tám file trên, đặt ở cùng đường dẫn tương đối |

## GitHub

| File | Mục đích |
|------|----------|
| `.github/workflows/release-please.yml` | Chạy release-please khi push lên `main` |
| `.github/PULL_REQUEST_TEMPLATE.md` | Hướng dẫn Conventional Commit, harness bị ảnh hưởng, và checklist kiểm tra gồm cả các mục đồng bộ chéo |
| `.github/ISSUE_TEMPLATE/config.yml` | Tắt issue trống, dẫn sang Discussions |
| `.github/ISSUE_TEMPLATE/bug-report.yml` | Form bug với dropdown harness và component. Danh sách component phải có đủ 19 skill, cộng profile, lớp dùng chung và hook |
| `.github/ISSUE_TEMPLATE/feature-request.yml` | Form tính năng, hỏi tình huống của team trước khi hỏi năng lực đề xuất |
