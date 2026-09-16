# Tổng hợp mã nguồn

Bản tra cứu từng file đang được quản lý trong repo. Tài liệu này lỗi thời ngay khi có file được
thêm, xóa hoặc đổi tên; hãy cập nhật trong cùng commit đó.

## Thư mục gốc

| File | Mục đích |
|------|----------|
| `README.md` | Điểm vào công khai: sơ đồ vòng đời, bảng 12 skill, khối invocation, quy ước output, hướng dẫn cài đặt |
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
| `shared/artifact-paths.md` | Cách xác định thư mục docs gốc, đường dẫn output mặc định theo skill, quy tắc đặt tên `YYMMDD`, cách đánh số ADR, khối front matter dùng chung, và nguyên tắc không ghi đè artifact đã `APPROVED` |
| `shared/ticket-adapters.md` | Thứ tự phát hiện tracker, bảng ánh xạ từ vựng atk sang GitHub Issues, Jira, Backlog và Redmine, các lệnh đẩy bằng `gh`, và quy tắc liên kết hai chiều |
| `shared/review-checklist.md` | Định dạng bản ghi quy tắc `CONV-NNN` mà `convention` viết ra và `review` trích dẫn, vai trò của từng skill với nó, tám mục nền kèm mức nghiêm trọng mặc định, và quy tắc loại bỏ quy tắc đã cũ. Chỉ `convention` và `review` trích dẫn |

## Các skill

Mỗi skill hiện chỉ có một `SKILL.md`, chưa có `references/` hay `evals/`.

| File | Chặng | Sinh ra |
|------|-------|---------|
| `skills/intake/SKILL.md` | Yêu cầu | User story, tiêu chí nghiệm thu, ngoài phạm vi, câu hỏi treo có người phụ trách |
| `skills/estimate/SKILL.md` | Lập kế hoạch | Ước lượng có căn cứ và độ tin cậy, capacity, cam kết sprint, phần dư |
| `skills/design-doc/SKILL.md` | Thiết kế | Tài liệu thiết kế có so sánh phương án, kèm ADR |
| `skills/breakdown/SKILL.md` | Lập kế hoạch | Task có người nhận, đồ thị phụ thuộc, làn song song kèm quyền sở hữu file |
| `skills/convention/SKILL.md` | Phát triển | Quy ước team phân loại enforced / reviewed / aspirational |
| `skills/review/SKILL.md` | Phát triển | Phát hiện xếp hạng blocking / should fix / nit, có thể đăng lên PR |
| `skills/qa/SKILL.md` | Kiểm thử | Test plan, test case có truy vết, ma trận regression, tiêu chí vào và ra |
| `skills/release/SKILL.md` | Bàn giao | Ghi chú theo đối tượng, checklist có người phụ trách, migration, rollback, phê duyệt |
| `skills/incident/SKILL.md` | Vận hành | Timeline, nguyên nhân gốc có bằng chứng, postmortem, hành động, runbook |
| `skills/retro/SKILL.md` | Cải tiến | Kiểm chứng hành động cũ, bằng chứng sprint, ba hành động mới, báo cáo |
| `skills/onboard/SKILL.md` | Con người | Cài đặt đã kiểm chứng, danh sách quyền, bản đồ code, tuần đầu kết thúc bằng một merge |
| `skills/handover/SKILL.md` | Con người | Trạng thái thật của việc dở, quyết định, bẫy, chuyển giao quyền, người nhận ký |

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
| `docs/codebase-summary.md` | Chính là file này |
| `docs/project-roadmap.md` | Kế hoạch theo phase và trạng thái |
| `docs/vi/*.md` | Bản tiếng Việt mirror năm file trên |

## GitHub

| File | Mục đích |
|------|----------|
| `.github/workflows/release-please.yml` | Chạy release-please khi push lên `main` |
| `.github/PULL_REQUEST_TEMPLATE.md` | Hướng dẫn Conventional Commit, harness bị ảnh hưởng, và checklist kiểm tra gồm cả các mục đồng bộ chéo |
| `.github/ISSUE_TEMPLATE/config.yml` | Tắt issue trống, dẫn sang Discussions |
| `.github/ISSUE_TEMPLATE/bug-report.yml` | Form bug với dropdown harness và component. Danh sách component phải có đủ 12 skill |
| `.github/ISSUE_TEMPLATE/feature-request.yml` | Form tính năng, hỏi tình huống của team trước khi hỏi năng lực đề xuất |
