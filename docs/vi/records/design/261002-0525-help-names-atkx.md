---
title: atk:help nêu tên skill của atkx, ngoại lệ duy nhất của quy tắc một chiều
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-02
updated: 2026-10-02
ticket: none
---

# atk:help nêu tên skill của atkx, ngoại lệ duy nhất của quy tắc một chiều

Bản tiếng Việt để đọc cho tiện. Bản gốc là
`docs/records/design/261002-0525-help-names-atkx.md`; khi hai bản khác nhau, bản tiếng Anh là bản
đúng.

## Tóm tắt

Trước đây `atk:help` không trả lời được về skill của `atkx`. Hỏi nó "đánh giá skill tôi vừa viết" thì
nó bảo yêu cầu nằm ngoài kit, và không nêu tên `atkx:skill-eval`. `CONV-011` buộc nó trả lời như vậy:
`atk` không bao giờ nhắc tên `atkx`, để một đội chỉ cài `atk` không gặp một chỉ dẫn mà họ không đi
theo được.

Ngày 2026-10-02 người bảo trì quyết định bỏ quy tắc đó cho riêng `atk:help`. Hai plugin đến từ cùng
một marketplace, và người đang hỏi nên chạy skill nào thì được giúp nhiều hơn khi nhận tên skill kèm
dòng lệnh cài, thay vì câu "nằm ngoài kit". Giờ đây `atk:help` nêu tên một skill của `atkx` khi không
skill `atk` nào phù hợp, và thêm lệnh cài khi skill đó chưa được cài. Mọi skill khác, file dùng chung
và hook vẫn không nhắc gì tới `atkx`.

## Yêu cầu

Chưa có artifact yêu cầu nào. Yêu cầu đến từ chính phiên làm việc đã tạo ra record này:

| # | Tiêu chí | Nguồn |
|---|----------|-------|
| AC1 | `atk:help` nêu tên skill của `atkx` cho câu hỏi mà chỉ `atkx` xử lý | người bảo trì, 2026-10-02 |
| AC2 | Nó nêu tên dù `atkx` đã cài hay chưa, kèm lệnh cài khi chưa cài | người bảo trì, 2026-10-02 |
| AC3 | Ngoại lệ chỉ áp dụng cho `atk:help`; `CONV-011` vẫn giữ với 23 skill còn lại, `shared/` và `hooks/` | người bảo trì, 2026-10-02 |
| AC4 | Một plugin không đọc gì nằm ngoài thư mục của chính nó (`CONV-012`) | `CLAUDE.md`, "Multi-manifest layout" |

## Hiện trạng

- **`help` tìm skill bằng cách đọc các thư mục bên cạnh.** Bước 2 của
  `plugins/atk/skills/help/SKILL.md` đọc `../*/SKILL.md`, nơi chỉ có 24 skill `atk`. Trên máy người
  dùng, `plugins/atkx/` không nằm cạnh nó, nên `help` không đọc được skill của `atkx` từ đĩa.
- **`CONV-011` cấm từ này.** Ngày 2026-10-02, trước thay đổi này,
  `grep -rn "\batkx\b" plugins/atk/ --exclude=CHANGELOG.md` không in ra gì.
- **`docs/adr/0001-atk-and-atkx-as-sibling-plugins.md`** ghi quy tắc này như một phần của quyết định
  để hai kit thành hai plugin anh em.

## Các phương án

### Phương án A: giữ quy tắc, sau này cho `atkx` một skill hướng dẫn riêng

`atk:help` giữ nguyên; một skill `atkx` mang tên khác liệt kê skill của `atkx` và chuyển câu hỏi về
vòng đời sang `/atk:help`. Đây là đề xuất đầu tiên trong phiên. Đội chỉ cài `atk` vẫn không thấy chỉ
dẫn nào tới `atkx`, nhưng ai hỏi `atk:help` vẫn nghe câu "nằm ngoài kit" cho một skill do chính
marketplace đó cung cấp. Người bảo trì bác phương án này vì lý do ấy.

### Phương án B: chỉ nêu tên skill của `atkx` khi `atkx` đã được cài

Đội chỉ cài `atk` không biết tới `atkx`. Người bảo trì bác phương án này để giữ AC2: người chưa biết
`atkx` tồn tại chính là người được câu trả lời giúp nhiều nhất.

### Phương án C: `atk:help` luôn nêu tên skill `atkx` phù hợp, kèm lệnh cài (được chọn)

- Đáp ứng AC1 và AC2.
- Chi phí, người bảo trì đã chấp nhận: đội chỉ cài `atk` sẽ thấy gợi ý cài `atkx`. Đó là chỉ dẫn họ
  đi theo được, vì dòng lệnh cài nằm ngay trong câu trả lời, mà quy tắc cũ cấm chỉ dẫn chính vì lý do
  không đi theo được.

### Phương án D: cho mọi skill `atk` nêu tên `atkx`

Bị bác vì AC3. Một skill dừng giữa quy trình rồi chỉ sang plugin khác chính là ngõ cụt mà quy tắc
sinh ra để ngăn; định tuyến vẫn là việc của `atk:help`.

## Hướng được chọn: Phương án C

### Danh sách nằm ở đâu

`plugins/atk/skills/help/references/atkx-skills.md` có một dòng cho mỗi skill `atkx`: dùng để làm gì,
harness nào hỗ trợ, và lệnh cài cho từng harness. Đây là bản sao, vì thư mục `atkx` nằm ngoài plugin
`atk` (AC4). Khi skill có trong danh sách skill đang chạy của host, `help` trả lời theo `description`
trực tiếp, vì nó mới hơn bản sao.

### `help` dùng danh sách thế nào

- **Chế độ hỏi.** Các dòng `atkx` là ứng viên đứng cạnh các skill `atk`, được xếp hạng bằng chính phép
  thử mà bước 4 đã dùng giữa hai skill `atk`: skill `atk` nào có `## Scope` xử lý yêu cầu thì thắng;
  dòng `atkx` nào có `Use when` nêu thẳng yêu cầu thì thắng skill `atk` chỉ nghe có vẻ gần; khi cả hai
  vẫn phù hợp, skill `atk` được nêu tên còn skill `atkx` xếp vào `Also considered`. Bản nháp đầu chỉ
  đọc danh sách `atkx` khi không skill `atk` nào phù hợp, và review cho thấy như thế có thể đưa câu
  "đánh giá skill tôi viết" tới `atk:review` mà không bao giờ tới `atkx:skill-eval`.
- **Các trường không có `SKILL.md` để đọc.** Danh sách ghi cách gọi của từng skill, `Needs first` là
  `nothing; it needs no profile`, và `Approved by` là `none; it writes nothing a teammate approves`.
- **Chế độ skill.** Áp dụng cho đối số có tiền tố `atkx:` hoặc một tên có trong danh sách.
- **Chế độ trạng thái.** Không bao giờ. Không có gì trên đĩa cho biết skill `atkx` là skill chạy tiếp
  theo.
- **Đầu ra.** `Run: /atkx:<skill>`, cộng thêm một dòng `Install` cho harness của người hỏi khi skill
  chưa được cài.

### Giữ bản sao đúng với thực tế

Danh sách việc phải làm khi thêm, đổi tên hoặc xóa một skill `atkx` trong `CLAUDE.md` có thêm nhóm
thứ chín: bảng Skills của `atkx-skills.md`. Một phép kiểm tra trong "Common verification commands" báo
lỗi khi bảng đó và `plugins/atkx/skills/` không khớp nhau.

### `CONV-011` sau thay đổi

`atk` không bao giờ gọi `atkx`, và chỉ `atk:help` nêu tên nó. Phép kiểm tra trở thành:

```bash
grep -rn "\batkx\b" plugins/atk/ --exclude=CHANGELOG.md | grep -v '^plugins/atk/skills/help/'
```

### Những gì thay đổi

- `plugins/atk/skills/help/SKILL.md`: Scope, dòng của chế độ skill, bước 2, bước 4, Output,
  Definition of done.
- `plugins/atk/skills/help/references/atkx-skills.md`: file mới.
- `plugins/atk/shared/host-capabilities.md`: một dòng cho phép riêng `atk:help` nêu tên skill của
  plugin đi kèm, viết mà không dùng từ đó để `CONV-011` vẫn bao được `shared/`.
- `plugins/atk/skills/help/evals/trigger_evals.json`: hai trường hợp dẫn tới `atkx`.
- `CLAUDE.md`: mục `atkx`, danh sách skill `atkx`, `CONV-011`, `CONV-013`, và phép kiểm tra mới.
- `docs/adr/0001-atk-and-atkx-as-sibling-plugins.md` và bản đối ứng: một phần sửa đổi trỏ về đây.
- `docs/system-architecture.md`, `docs/codebase-summary.md`, các bản đối ứng của chúng, và
  `.atk/profile.md`.

## Truy vết

| Tiêu chí | Được đáp ứng ở đâu |
|----------|--------------------|
| AC1 | bước 4 của `help`, chế độ hỏi, và mục Which one wins trong `atkx-skills.md` |
| AC2 | dòng `Install` trong Output |
| AC3 | phần loại trừ của `grep -v` chỉ là thư mục `help` |
| AC4 | danh sách được sao chép; `help` không đọc đường dẫn nào ngoài `plugins/atk/` |

## Người review

- Tech Lead: Lam Ngoc Khuong, người duyệt. `.atk/profile.md` không có BrSE hay SRE cho repository
  này, nên không cần chữ ký nào khác.

Sửa đổi: `docs/adr/0001-atk-and-atkx-as-sibling-plugins.md`.
