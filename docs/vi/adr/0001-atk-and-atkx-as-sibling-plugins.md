---
title: "ADR 0001: atk và atkx là hai plugin cạnh nhau trong một repository"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-09-30
updated: 2026-10-02
ticket: none
---

# ADR 0001: atk và atkx là hai plugin cạnh nhau trong một repository

Design: `docs/records/design/260930-0933-atkx-utility-kit-placement.md`

## Bối cảnh

Có những skill hữu ích nhưng không thuộc giai đoạn nào trong quy trình giao hàng của đội, và cũng
không tạo ra artifact nào để đồng đội review. Skill đánh giá một skill khác là ví dụ đầu tiên. Thêm
chúng vào `atk` sẽ làm yếu tiền đề của kit, nên cần một bộ kit thứ hai là `atkx`. Skill của `atkx`
được gọi skill của `atk`, còn `atk` không bao giờ gọi hay nhắc tên `atkx`.

Repository này được cài như một plugin duy nhất với `"source": "./"`, nên bản cài nào cũng mang cả
cây thư mục, kể cả `docs/`, `plans/` và `.atk/`. Tài liệu của Claude Code, Cursor và Codex đều mô tả
cách một repository chứa nhiều plugin, mỗi plugin một thư mục, và cả ba đều từ chối đường dẫn đi ra
ngoài thư mục của plugin. Vì thế hai kit trong một repository không dùng chung file được, và ngày
2026-10-01 người bảo trì đã quyết định là chúng sẽ không dùng chung.

## Quyết định

`atk` chuyển vào `plugins/atk/`, còn `atkx` được tạo ở `plugins/atkx/`. Mỗi thư mục là một plugin
hoàn chỉnh với ba manifest riêng, và không đọc file nào của plugin kia, kể cả qua symlink. Gốc
repository chứa ba file marketplace, mỗi harness một file, cùng tài liệu của chính repository.

`atkx` khai báo `atk` là phụ thuộc trong `plugin.json` dành cho Claude Code. Ngoài ra, khi chạy, các
skill của `atkx` vẫn kiểm tra skill `atk` mà chúng gọi đã được cài chưa, vì tài liệu của Cursor và
Codex không có trường khai báo phụ thuộc.

`atk` thêm một quy tắc review là `CONV-011`: không file nào dưới `plugins/atk/` được nhắc tên một
lệnh của `atkx`.

## Hệ quả

- Bản cài `atk` chỉ mang `plugins/atk/`, ít hơn so với bây giờ.
- Định danh plugin `atk@atk` giữ nguyên, còn `source` chuyển từ `./` sang `./plugins/atk`. Người bảo
  trì chấp nhận việc người dùng hiện có có thể phải cài lại.
- Khoảng một nghìn tham chiếu đường dẫn nằm ngoài các plugin phải viết lại, trong đó có mọi lệnh
  kiểm tra trong `CLAUDE.md`. Các record đã commit giữ nguyên đường dẫn cũ.
- Mỗi kit có package phát hành và phiên bản riêng, và tag đổi từ `v0.0.21` sang `atk-v0.0.22` và
  `atkx-v0.0.1`. Phụ thuộc không ghi khoảng phiên bản, vì dạng tag mà Claude Code dùng để tìm theo
  khoảng phiên bản, `atk--v0.0.22`, là dạng release-please không đọc lại được.
- Bản cài làm từ bố cục cũ có thể không đi theo `source` mới khi cập nhật. Khi đó người dùng gỡ ra
  rồi cài lại.
- Quy tắc nào cả hai kit cùng cần thì được viết ở mỗi kit, và bản chép ghi rõ lấy từ file nào.

Ghi chú thêm ngày 2026-10-01, trước khi thay đổi được merge: hai dự đoán ở trên không xảy ra. `v0.1.0`
đã được phát hành trước khi chuyển thư mục, nên các tag đầu tiên sau đó là `atk-v0.1.1` và
`atkx-v0.0.1`, còn `atk-v0.1.0` được gắn vào commit của `v0.1.0` để làm mốc. Trên Claude Code, bản
cài làm ở `v0.1.0` khi cập nhật đã đi theo `source` mới, miễn là phiên bản đã tăng qua `0.1.0`, nên không ai phải cài lại. Bản thân quyết
định không đổi.

Sửa đổi ngày 2026-10-02: `CONV-011` giờ có một ngoại lệ. Khi không skill `atk` nào khớp, `atk:help`
nêu tên skill `atkx` phù hợp, kèm lệnh cài nếu skill đó chưa được cài. Danh sách skill `atkx` nằm
ngay trong skill `help`. Mọi phần khác của `atk` vẫn không nhắc tới `atkx`, và `atk` vẫn không gọi
skill nào của `atkx`. Quyết định được ghi ở `docs/records/design/261002-0525-help-names-atkx.md`.

## Phương án bị loại

- **Thư mục con `atkx/`, để `atk` ở gốc.** `atk` vẫn sẽ cài cả repository, kể cả `atkx/`.
- **Repository riêng cho `atkx`.** Rẻ nhất và là lựa chọn của bản nháp đầu, nhưng người bảo trì muốn
  cả hai kit ở trong repository này, và các chi phí mà phương án này tránh được đã được chấp nhận
  ngày 2026-10-01.
- **Đưa các tiện ích vào `atk` như skill thông thường.** Một skill không có artifact và không có
  người duyệt thì không qua được tiêu chí repository này dùng để nhận skill. Chính tiêu chí đó là lý
  do `simplify` bị loại còn `spec` được nhận.
