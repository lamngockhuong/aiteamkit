# Kiến trúc hệ thống

## Hình dạng

`atk` là nội dung cộng với manifest. Không có bước build, không bundler, không runtime: harness đọc
thẳng Markdown và JSON từ cây thư mục của repo.

```
aiteamkit/
  .claude-plugin/     plugin.json + marketplace.json     Claude Code
  .cursor-plugin/     plugin.json                        Cursor
  .codex-plugin/      plugin.json (+ khối interface)     OpenAI Codex CLI
  skills/<name>/SKILL.md        12 skill, mỗi skill một thư mục
  shared/*.md                   lớp DRY dùng chung cho cả 12 skill
  assets/*.svg                  icon và logo cho trang marketplace
  docs/, docs/vi/               tài liệu dự án song ngữ
```

## Một cây nội dung, ba manifest

Ba thư mục manifest cùng mô tả một thư mục `skills/` cho ba harness. Nội dung skill không bao giờ bị
nhân bản theo từng harness. Các manifest chỉ khác nhau ở cách khai báo nội dung:

| Manifest | Cách khai báo skill | Phần riêng của harness |
|----------|---------------------|------------------------|
| `.claude-plugin/plugin.json` | không khai báo; Claude Code tự quét `skills/` | có `marketplace.json` đi kèm |
| `.cursor-plugin/plugin.json` | `"skills": "./skills/"` | `displayName` |
| `.codex-plugin/plugin.json` | `"skills": "./skills/"` | khối `interface{}` với `defaultPrompt`, icon, `brandColor` |

Không có lớp `commands/`. Mỗi skill tự là một slash command, lấy tên từ thư mục của nó, và được
harness gắn namespace `atk:` lúc nạp dựa trên `plugin.json`.

## Mô hình nạp

Lúc khởi động, harness chỉ nạp phần frontmatter của mọi `SKILL.md`. Chính phần frontmatter đó, chủ
yếu là trường `description` với các cụm trigger, là thứ bộ định tuyến đem ra so khớp với yêu cầu của
người dùng. Phần thân `SKILL.md` chỉ được đọc sau khi skill đã được chọn.

Điều này sinh ra kỷ luật về kích thước của cả bộ kit:

| Lớp | Nạp khi nào | Ngân sách |
|-----|-------------|-----------|
| frontmatter `description` | Luôn luôn, cho cả 12 skill | Vài dòng; trigger chỉ đặt ở đây, không đặt chỗ khác |
| thân `SKILL.md` | Khi skill được gọi | Dưới 300 dòng |
| `references/*.md` | Chỉ khi một bước trong workflow mở nó | Không giới hạn, nằm ngoài đường đi mặc định |
| `shared/*.md` | Chỉ khi một skill trích dẫn nó | Nhỏ, vì nhiều skill có thể cùng mở |

## Lớp `shared/`

Bốn file giữ những gì các skill sẽ phải lặp lại. Ba file đầu được cả 12 skill trích dẫn:

- `shared/team-roles.md`: bảng vai trò và sáu nguyên tắc mà mọi skill tuân theo.
- `shared/artifact-paths.md`: đường dẫn output mặc định theo từng skill, quy tắc đặt tên, front matter.
- `shared/ticket-adapters.md`: cách phát hiện tracker và bảng ánh xạ từ vựng.

File thứ tư là hợp đồng giữa hai skill chứ không phải nguyên tắc toàn kit:

- `shared/review-checklist.md`: định dạng bản ghi quy tắc mà `atk:convention` viết ra và `atk:review`
  trích dẫn theo ID, cộng với các mục nền đúng với mọi dự án. Nó tồn tại để một quy ước chỉ viết một
  lần và được kiểm bằng đúng câu chữ đó, thay vì bị chép lại ở cả hai skill rồi lệch nhau.

`shared/` nằm ở gốc repo chứ không nằm trong `skills/`, vì một thư mục bên trong `skills/` mà không
có `SKILL.md` sẽ gây nhập nhằng cho cơ chế quét skill. Các skill trích dẫn theo dạng
`shared/<file>.md`, tương đương `../../shared/<file>.md` tính từ một file skill; cả hai cách viết đều
có trong phần đầu của mỗi file shared.

## Giải phẫu một skill

Mọi `SKILL.md` theo cùng một thứ tự mục, cũng chính là thứ tự đọc mà một agent cần:

```
frontmatter        name, description kèm trigger, argument-hint
tiêu đề + mở đầu   skill này sinh ra gì và thói quen nào làm nó hiệu quả
## Scope           làm gì / KHÔNG làm gì, kèm tên skill tiếp quản phần còn lại
## Roles           ai viết, ai duyệt, ai được hỏi ý kiến
## Invocation      các flag, mỗi flag một dòng chú thích
## Workflow        sơ đồ ASCII, rồi từng bước được đánh số
## Output          đường dẫn artifact và danh sách mục
## Ticket          cách đưa kết quả vào tracker của team
## Definition of done   checklist skill phải thỏa trước khi báo hoàn thành
```

## Luồng dữ liệu lúc chạy

```
yêu cầu của người dùng
   -> harness so khớp trigger trong description
   -> nạp thân SKILL.md
   -> skill đọc bằng chứng của dự án (code, git, CI, tracker) và các file shared/
   -> skill chỉ phỏng vấn phần mà bằng chứng không trả lời được
   -> ghi artifact Markdown vào dự án đích, dưới docs/
   -> tùy chọn đẩy con trỏ lên tracker, sau khi người dùng duyệt danh sách
```

Artifact luôn được ghi vào **dự án đích**, không bao giờ ghi vào chính bộ kit atk.

## Quản lý phiên bản

Một phiên bản trải trên sáu file, năm trong số đó do `extra-files` trong
`release-please-config.json` điều khiển, còn `.release-please-manifest.json` do chính release-please
sở hữu. Workflow release chạy khi push lên `main`. Chi tiết nằm trong `CLAUDE.md`.
