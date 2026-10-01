---
title: Bộ kit skill tiện ích thứ hai, atkx, đặt ở đâu và phụ thuộc vào atk thế nào
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-09-30
updated: 2026-10-01
ticket: none
---

# Bộ kit skill tiện ích thứ hai, atkx, đặt ở đâu và phụ thuộc vào atk thế nào

Bản tiếng Việt để đọc cho tiện. Bản gốc là
`docs/records/design/260930-0933-atkx-utility-kit-placement.md`; khi hai bản khác nhau, bản tiếng
Anh là bản đúng.

## Tóm tắt

Người bảo trì muốn có một bộ kit thứ hai là `atkx`, chứa các skill tiện ích không tạo artifact nào
cho đội và không thuộc giai đoạn nào của quy trình giao hàng. Ứng viên đầu tiên là một skill đánh
giá skill khác. `atkx` được gọi skill của `atk`, còn `atk` không bao giờ tự gọi `atkx`.

Bản design này chuyển `atk` vào `plugins/atk/` và tạo `atkx` ngay bên cạnh ở `plugins/atkx/`, trong
chính repository này. Mỗi thư mục là một plugin hoàn chỉnh, và không plugin nào đọc file của plugin
kia. Đằng nào thì bộ cài cũng chỉ chép thư mục của chính plugin và không chép gì ở cấp trên, nên
tách riêng hai plugin là bố cục duy nhất chạy được.

Bản nháp đầu của design này, viết ngày 2026-09-30, đề xuất một repository riêng. Ngày 2026-10-01
người bảo trì quyết định bốn điều làm thay đổi phép so sánh: hai kit không dùng chung file nào,
người dùng hiện có được phép đổi nguồn cài, chấp nhận việc viết lại đường dẫn, và chấp nhận đổi dạng
tag. Khi không còn chuyện dùng chung, đặt cùng repository chỉ tốn những gì người bảo trì đã chấp
nhận, và nó đáp ứng được một tiêu chí mà repository riêng không đáp ứng.

## Yêu cầu

Chưa có artifact yêu cầu nào. Yêu cầu đến từ chính các phiên làm việc đã tạo ra bản design này, và
các tiêu chí dưới đây ghi lại nó:

| # | Tiêu chí | Nguồn |
|---|----------|-------|
| AC1 | `atkx` chứa các skill tiện ích không phụ thuộc vào artifact nào và vào vòng đời giao hàng nào | người bảo trì, 2026-09-30 |
| AC2 | Skill của `atkx` được gọi skill của `atk` | người bảo trì, 2026-09-30 |
| AC3 | `atk` không bao giờ gọi hay nhắc tên skill nào của `atkx` | người bảo trì, 2026-09-30 |
| AC4 | `atkx` nằm trong repository này | người bảo trì, 2026-09-30, xác nhận 2026-10-01 |
| AC5 | Không plugin nào đọc file của plugin kia | người bảo trì, 2026-10-01 |

Ngày 2026-10-01 người bảo trì cũng chấp nhận ba chi phí, nên bản design này không phản bác chúng
nữa: người dùng hiện có phải đổi nguồn cài, khoảng một nghìn tham chiếu đường dẫn nằm ngoài các
plugin phải viết lại, và dạng tag thay đổi.

## Hiện trạng

- **Một repository được cài thành một plugin.** `.claude-plugin/marketplace.json` liệt kê một
  plugin với `"source": "./"`. `CLAUDE.md`, mục "`.atk/` in the target project", ghi rằng khi cài,
  thư mục plugin được chép nguyên trạng, nên hiện nay `.atk/`, `docs/`, `plans/` và `CHANGELOG.md`
  đều đến tay mọi người dùng.
- **Việc tìm skill gắn với gốc plugin.** Claude Code tìm `skills/` ở gốc plugin
  (`.claude-plugin/plugin.json` không có khóa `skills`). `.cursor-plugin/plugin.json` và
  `.codex-plugin/plugin.json` đều trỏ tới `"./skills/"`.
- **Đường dẫn bên trong kit tính từ kit.** Skill trích dẫn `../../shared/<file>.md`, còn hook tìm
  đường qua `${CLAUDE_PLUGIN_ROOT}` và `${PLUGIN_ROOT}`. Dời `skills/`, `shared/`, `hooks/` và
  `assets/` xuống cùng lúc thì mọi đường dẫn này vẫn đúng.
- **Đường dẫn bên ngoài kit tính từ repository.** Ngày 2026-10-01, `grep -rn -F "skills/"` trên
  `CLAUDE.md`, `README.md`, `docs/`, `.github/` và `.atk/` đếm được 1023 dòng, chưa tính `shared/`
  và `hooks/`.
- **Một package phát hành.** `release-please-config.json` định nghĩa một package là `"."`, với năm
  `extra-files` dùng chung một phiên bản, hôm nay là `0.0.21`. Tag không có tiền tố: `v0.0.7`,
  `v0.0.8` và tiếp tục như vậy. `skills/help/references/state-signals.md:58`, tín hiệu 17, đọc "tag
  phiên bản mới nhất".
- **Chỉ Claude Code có file marketplace.** `README.md:166-176` hướng dẫn người dùng Cursor chạy
  `/add-plugin atk` và người dùng Codex tìm trong `/plugins`. Ngày 2026-10-01 người bảo trì xác nhận
  `atk` chưa từng được gửi lên marketplace có kiểm duyệt của Cursor, nên dòng hướng dẫn cho Cursor
  đang trỏ tới một mục không tồn tại, và sau khi dời thư mục cũng không phải gửi yêu cầu lập chỉ mục
  lại.

Tài liệu của mỗi harness nói gì về một repository chứa nhiều plugin, đọc ngày 2026-10-01:

| | Claude Code | Cursor | Codex |
|---|---|---|---|
| Nhiều plugin trong một repository | Có: mỗi plugin một mục trong `marketplace.json`, mỗi mục có `source` tương đối như `"./plugins/atk"` | Có: "A single Git repository can contain multiple plugins using a marketplace manifest" | Có: mỗi plugin nằm ở `$REPO_ROOT/plugins/<tên>` |
| File marketplace | `.claude-plugin/marketplace.json` | `.cursor-plugin/marketplace.json` | `.agents/plugins/marketplace.json` |
| Đường dẫn ra ngoài plugin (`..`) | Không qua được bước kiểm tra | Không cho phép: "no `..`, no absolute paths" | Không cho phép: đường dẫn phải "stay inside the plugin root" |
| Phụ thuộc giữa các plugin | `dependencies` trong `plugin.json`, cài từ cùng marketplace | Không có trong tài liệu | Không có trong tài liệu |

Nguồn: [Claude Code marketplace reference](https://code.claude.com/docs/en/plugins/marketplace-reference),
[Claude Code plugin dependencies](https://code.claude.com/docs/en/plugins/dependencies),
[Claude Code hosting](https://code.claude.com/docs/en/plugins/host-marketplace),
[Cursor plugins reference](https://cursor.com/docs/reference/plugins),
[Codex plugin packaging](https://developers.openai.com/codex/plugins/build), tất cả đọc ngày
2026-10-01.

## Tiêu chí quyết định

1. **Đáp ứng AC1 đến AC5**, trước hết là AC4, vì người bảo trì đã xác nhận nó.
2. **Rủi ro cho `atk`**: người dùng `atk` nhận thêm hay mất đi gì vì `atkx` tồn tại.
3. **Độ chắc chắn về harness**: tài liệu của từng harness có mô tả bố cục này không.
4. **Khả năng đảo ngược**: phải trả gì nếu sau này muốn bỏ lựa chọn này.

Chi phí phát hành và việc viết lại đường dẫn không còn là tiêu chí: người bảo trì đã chấp nhận chúng
ngày 2026-10-01.

## Các phương án

### Phương án A: thư mục con `atkx/`, `atk` vẫn ở gốc (lựa chọn mặc định)

`atkx/` có manifest riêng, marketplace thêm `"source": "./atkx"`, còn `atk` giữ nguyên ở `"./"`.
Đây là thay đổi nhỏ nhất, nên một đội sẽ nghĩ tới nó đầu tiên.

Nó thua ở tiêu chí rủi ro cho `atk`: `atk` vẫn cài cả repository, nên bản cài `atk` nào cũng mang
theo `atkx/`, `docs/`, `plans/` và `.atk/`. Lệnh `grep` tìm em-dash quét `.` cũng sẽ quét luôn
`atkx/` mà không ai quyết định như vậy.

### Phương án B: cả hai kit nằm dưới `plugins/` (được chọn)

`plugins/atk/` và `plugins/atkx/`, mỗi thư mục là một plugin hoàn chỉnh. Gốc repository chứa các
file marketplace và những gì repository viết về chính nó: `docs/`, `plans/`, `.atk/`, `CLAUDE.md`,
`README.md`.

- **AC1 đến AC5**: đáp ứng cả năm; xem Truy vết.
- **Rủi ro cho `atk`**: bản cài `atk` chỉ nhận `plugins/atk/`, ít hơn so với bây giờ.
- **Độ chắc chắn về harness**: tài liệu của cả ba harness đều mô tả bố cục này. Codex dùng đúng dạng
  `plugins/<tên>` trong hướng dẫn của họ.
- **Khả năng đảo ngược**: sau này `plugins/atkx/` có thể tách ra thành repository riêng, vì không gì
  bên trong nó trỏ ra ngoài.

### Phương án C: một repository riêng

Đây là đề xuất của bản nháp đầu. Nó vẫn là phương án tốn ít nhất, nhưng không đáp ứng AC4, tiêu chí
mà người bảo trì đã xác nhận, và các chi phí nó tránh được lại là những chi phí người bảo trì đã chấp
nhận.

### Chấm điểm

| Tiêu chí | A: `atkx/` ở đây | B: `plugins/` ở đây | C: repository riêng |
|----------|------------------|---------------------|---------------------|
| AC4 | đáp ứng | đáp ứng | không đáp ứng |
| Rủi ro cho `atk` | bản cài nào cũng mang `atkx/` và tài liệu của repository | chỉ mang `plugins/atk/` | không có |
| Độ chắc chắn về harness | có trong tài liệu, nhưng gốc vừa là plugin vừa là marketplace | có trong tài liệu của cả ba | repository này đã chứng minh |
| Khả năng đảo ngược | tách `atkx/` ra kèm lịch sử | tách `plugins/atkx/` ra kèm lịch sử | lưu trữ repository |

## Hướng được chọn: Phương án B

### Bố cục

```
.claude-plugin/marketplace.json      lists atk and atkx; the root plugin.json is deleted
.cursor-plugin/marketplace.json      new; the root plugin.json is deleted
.agents/plugins/marketplace.json     new, for Codex; .codex-plugin/ at the root is deleted
plugins/atk/
  .claude-plugin/plugin.json  .cursor-plugin/plugin.json  .codex-plugin/plugin.json
  skills/  shared/  hooks/  assets/
plugins/atkx/
  .claude-plugin/plugin.json  .cursor-plugin/plugin.json  .codex-plugin/plugin.json
  skills/
docs/  plans/  .atk/  .github/  CLAUDE.md  README.md  CHANGELOG.md  LICENSE  package.json
```

Tên plugin `atk` và tên marketplace `atk` giữ nguyên, nên định danh plugin `atk@atk` mà người dùng
hiện có đang bật không đổi. Chỉ có `source` của nó thay đổi.

### Không dùng chung file (AC5)

Mỗi plugin mang theo mọi file nó đọc. Quy tắc nào cả hai kit cùng cần thì được viết ở mỗi kit, và
bản trong `atkx` ghi rõ lấy từ file nào của `atk`, để người đọc sau này so được hai bản.

Claude Code còn có một đường khác: symlink từ `plugins/atkx/` trỏ tới một file trong
`plugins/atk/` sẽ được thay bằng nội dung thật khi chép vào cache lúc cài. Tài liệu của Cursor và
Codex không mô tả hành vi này, nên kit không dùng nó, và review sẽ từ chối symlink nào đi từ plugin
này sang plugin kia.

### Cách `atkx` gọi `atk` (AC2)

- **Lúc cài, trên Claude Code.** `plugins/atkx/.claude-plugin/plugin.json` khai báo
  `"dependencies": ["atk"]`. Khi đó cài `atkx` sẽ cài luôn `atk` từ cùng marketplace, và tắt `atk`
  thì `atkx` không nạp được, kèm một lỗi nêu tên phụ thuộc.
- **Lúc chạy, trên mọi harness.** Tài liệu của Cursor và Codex không có trường phụ thuộc, nên skill
  của `atkx` vẫn kiểm tra `atk:<skill>` có trong danh sách skill hiện tại của host trước khi gọi.
  Nếu không có, nó in một dòng nêu tên kit và cách cài, rồi dừng hoặc chạy tiếp mà bỏ qua bước ấy,
  theo đúng điều `SKILL.md` của nó quy định.
- Skill của `atkx` gọi skill của `atk` bằng tên đầy đủ, chỉ truyền các tham số có trong
  `argument-hint` của skill đó, và để người dùng tự đi qua các cửa kiểm soát của skill được gọi:
  kiểm tra profile, phỏng vấn, trạng thái duyệt.

### Quy tắc một chiều (AC3)

`atk` thêm `CONV-011` vào Review checklist của `CLAUDE.md`: không file nào dưới `plugins/atk/` được
nhắc tên một lệnh hay một skill của `atkx`. Mức `BLOCKING`, loại `REVIEWED`. Lệnh kiểm tra đặt cạnh
lệnh của `CONV-004`:

```bash
grep -rn "\batkx:" plugins/atk/
```

Lệnh này không được in ra gì. Tài liệu ở gốc repository mô tả repository nên được nhắc tên cả hai
kit, vì vậy quy tắc chỉ bao phần nằm bên trong `atk`, cũng là phần người chỉ cài `atk` đọc thấy.

### Phát hành và tag

Hai package release-please, `plugins/atk` và `plugins/atkx`, mỗi package có phiên bản và
`extra-files` riêng. Các mục trong marketplace không ghi `version`, nên mỗi `plugin.json` là nơi duy
nhất chứa phiên bản, đúng như hướng dẫn về lưu trữ marketplace của Claude Code yêu cầu.

Tag theo dạng mặc định của release-please cho repository nhiều package, `<component>-v<version>`:
`atk-v0.0.22`, `atkx-v0.0.1`. Dạng mà Claude Code dùng để tìm tag cho khoảng phiên bản của phụ
thuộc, `atk--v0.0.22`, đã được kiểm tra và loại ngày 2026-10-01. Release-please ghi được dạng này
với `"tag-separator": "--"`, nhưng khi đọc lại tag nó dùng mẫu trong `src/util/tag-name.ts`, mà ở đó
dấu phân cách chỉ có một ký tự, nên `atk--v0.0.22` bị tách ra thành tên thành phần `atk-`. Sau đó
`src/manifest.ts` không tìm thấy package nào mang tên đó và báo `Found release tag with component
'atk-', but not configured in manifest`, nên release-please không có lần phát hành trước để so.

Vì vậy phụ thuộc không ghi khoảng phiên bản: `"dependencies": ["atk"]`. Hướng dẫn về phụ thuộc của
Claude Code nói một tên trần sẽ đi theo phiên bản mà marketplace đang cung cấp. Khi cả hai plugin ở
cùng một marketplace, đó chính là `atk` ở cùng commit.

Repository này phải xử lý thêm hai chuyện:

- **Lần phát hành đầu tiên sau khi dời thư mục.** Các tag hiện có, từ `v0.0.21` trở về trước, không
  có tên thành phần, nên package `plugins/atk` mới không nhận ra chúng. `.release-please-manifest.json`
  đổi khóa thành `"plugins/atk": "0.0.21"`, và `last-release-sha` trỏ tới commit của `v0.0.21` cho
  riêng lần phát hành đó. Chạy `release-please release-pr --dry-run` để xác nhận trước khi merge.
- **Tín hiệu 17 của `atk:help`** gặp hai dòng tag trong repository này, và `.atk/profile.md` ghi rõ
  `atk-v*` là dòng tag của `atk`.

### Chuyển đổi

1. Dời `skills/`, `shared/`, `hooks/` và `assets/` vào `plugins/atk/` bằng `git mv`, trong một
   commit, cùng với ba file `plugin.json`.
2. Trỏ mục Claude Code tới `"./plugins/atk"`, thêm file marketplace cho Cursor và Codex, và xóa các
   file `plugin.json` ở gốc.
3. Viết lại các đường dẫn nằm ngoài plugin: `CLAUDE.md`, gồm cả mọi lệnh kiểm tra, `README.md`,
   `docs/` và `docs/vi/`, `.github/labeler.yml`, các issue template, `.atk/profile.md` và
   `release-please-config.json`. Hai dòng hướng dẫn cài cho Cursor và Codex trong `README.md` được
   viết lại để cài thẳng từ repository này, theo cách mà bước 4 chứng minh là chạy được.
   `docs/records/` giữ đường dẫn cũ, vì record không được sửa sau khi đã commit.
4. Cài thử từ một bản clone trên cả ba harness, kiểm tra 23 skill và cả hai hook đều nạp được, và
   cập nhật một bản cài làm từ bố cục cũ để xem nó có đi theo `source` mới không. Xong bước này mới
   phát hành.
5. Thêm `plugins/atkx/` khi chưa có skill nào, rồi đến tiêu chí nhận skill, rồi mới đến skill đầu
   tiên, theo đúng thứ tự đó.

### Những gì `atkx` phải viết ra trước skill đầu tiên

Đặt trong `plugins/atkx/` hoặc trong một mục riêng của `CLAUDE.md` ở gốc:

1. **Tiêu chí nhận skill**, tức là AC1 viết thành văn bản. Một skill được nhận khi nó chạy được mà
   không cần `.atk/profile.md`, không ghi gì vào repository của đội mà đồng đội phải review, và nêu
   rõ những harness nó hỗ trợ đầy đủ.
2. **Mức hỗ trợ harness cho từng skill.** Đo trigger cần hook `PreToolUse` mô tả trong
   `docs/trigger-eval-measurement.md`. Trên Codex chưa ai thấy hook này chạy khi một skill được gọi,
   còn Cursor không có hook đó, nên skill nào đo trigger thì ghi "chỉ Claude Code" cho chế độ đó.
3. **Ban đầu chưa có hook riêng**, để người cài cả hai kit chỉ thấy nhắc nhở profile của `atk` một
   lần.

### Các mục khác

| Mục | Trả lời |
|-----|---------|
| Mô hình dữ liệu và migration | Không có dữ liệu. Việc dời file nằm ở phần Chuyển đổi |
| Hợp đồng API | Cách gọi nêu ở trên; không có API HTTP hay API thư viện |
| Lỗi và trường hợp biên | Thiếu `atk`: phụ thuộc trên Claude Code, dòng hướng dẫn cài ở các harness khác. Symlink giữa hai plugin: bị từ chối khi review |
| Tương thích ngược | Định danh `atk@atk` giữ nguyên. Nguồn chuyển từ `./` sang `./plugins/atk`, người bảo trì đã chấp nhận. Tài liệu không nói khi cập nhật thì bản cài có đi theo nguồn mới không; bước 4 của phần Chuyển đổi sẽ cho biết, và nếu không thì ghi chú phát hành hướng dẫn người dùng gỡ ra rồi cài lại, theo quyết định của người bảo trì ngày 2026-10-01 |
| Feature flag hoặc triển khai dần | `N/A`: bước 4 của phần Chuyển đổi là cửa kiểm soát |
| Rollback | Trước khi phát hành: revert commit dời thư mục. Sau khi phát hành: dời lại rồi phát hành tiếp, vì người dùng đi theo `source` trong file marketplace |
| Quan sát hệ thống | `N/A` |
| Bảo mật và quyền truy cập | Bản cài không còn mang `.atk/`, `docs/` hay `plans/`. Skill `atkx` chạy với quyền host của người dùng như mọi skill khác |
| Hiệu năng | Mỗi skill được cài thêm `description` của nó vào ngữ cảnh của mọi session. `atkx` là tùy chọn, nên người chỉ cài `atk` không tốn thêm gì |

## Truy vết

| Tiêu chí | Được đáp ứng ở đâu |
|----------|--------------------|
| AC1 | Tiêu chí nhận skill mà `atkx` viết đầu tiên |
| AC2 | Cách gọi: `dependencies` trên Claude Code, bước kiểm tra lúc chạy ở mọi harness |
| AC3 | `CONV-011` và lệnh `grep` của nó |
| AC4 | Bố cục |
| AC5 | Không dùng chung file, và không có symlink giữa hai plugin |

## Cần quyết định

| Câu hỏi | Người trả lời |
|---------|---------------|
| `atk` có nằm trong danh mục plugin của OpenAI, nơi `README.md` hướng người dùng Codex tới, không? Nếu có, danh mục đó có đi theo `.agents/plugins/marketplace.json` mới không. Chưa rõ tính đến 2026-10-01; bước 4 của phần Chuyển đổi cài thẳng từ repository bằng `codex plugin marketplace add`, cách này chạy được trong cả hai trường hợp | Lam Ngoc Khuong, PM |

## Người review

- Tech Lead: Lam Ngoc Khuong, người duyệt. `.atk/profile.md` không có BrSE hay SRE cho repository
  này, nên không cần chữ ký nào khác.

ADR: `docs/adr/0001-atk-and-atkx-as-sibling-plugins.md`.
