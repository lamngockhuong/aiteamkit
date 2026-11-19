---
title: "ADR 0018: atk:review đăng review lên pull request qua một script"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-19
updated: 2026-11-19
ticket: none
---

# ADR 0018: atk:review đăng review lên pull request qua một script

## Bối cảnh

Dưới `--comment`, `atk:review` đăng các finding thành inline comment kèm một bản tóm tắt. Kit đã nói
mỗi comment chứa gì, cách đọc các review trước và cách trả lời trong một thread, nhưng không nói gì về
việc tạo chính review đó. Mỗi lần đăng trong một session đều tự viết bộ dựng payload và kiểm tay
từng dòng inline với diff của pull request: bản tóm tắt chứa backtick, dấu nháy và khối `<details>`
mà shell quoting làm hỏng, và GitHub từ chối cả review khi một dòng inline nằm ngoài mọi hunk của pull
request so với base. Một finding đã phải dời dòng vì lý do đó. `atk:tailor --feedback review --runs`
ghi lại điều này ngày 2026-11-19, finding 1.

Một dòng có nằm trong diff hay không chỉ có một đáp án cho một base và một head. Đó là loại kiểm tra
mà ADR 0002 và ADR 0017 giao cho script thay vì cho agent.

## Quyết định

`atk:review` mang `scripts/post-review.mjs`, Node với thư viện chuẩn, chạy `git` qua bộ chạy trong
`scripts/lib/git-history-stream.mjs` của `atk:security` thay vì một bản sao thứ hai. Session ghi một spec
thành file bằng thao tác ghi file của harness: repository, pull request, base mà bước mask đã diff,
commit được review, event, bản tóm tắt và các inline comment. Script kiểm từng dòng inline với
`<base>...<commit>` của riêng file đó, ba dòng ngữ cảnh như GitHub hiển thị, và không gửi gì khi có
dòng nằm ngoài, kèm dòng được thêm gần nhất. Với `--post`, chỉ truyền sau khi người dùng đồng ý, nó
tạo một review qua `POST /repos/{owner}/{repo}/pulls/<n>/reviews` với payload truyền bằng file, rồi
đọc lại các comment của review và cho biết từng comment có nằm đúng dòng không. Nó từ chối `APPROVE`,
vì approve là hành động của một người. Nó in một đối tượng JSON, không bao giờ in một dòng của file,
và thoát `0`; `3` khi có dòng nằm ngoài diff, GitHub từ chối review hoặc một comment không nằm đúng
dòng; `2` khi không chạy được.

Finding dời sang dòng nào, có giữ lại trong bản tóm tắt hay không, và có đăng hay không vẫn do
session và người dùng quyết, theo `shared/ticket-adapters.md` và `references/report-format.md`.

## Hệ quả

- `atk:review` là skill `atk` thứ hai có script; `CLAUDE.md` và `docs/system-architecture.md` nói rõ
  điều này.
- `tests/verify.sh` chạy script trên một repository nó tự dựng, với một bản thay thế `gh` trên
  `PATH`, nên phép kiểm không gửi gì đi.
- Máy không có Node hoặc không có `gh` thì không đăng được; review vẫn được ghi thành báo cáo.
- File bị đổi tên trong pull request được diff như file thêm mới, vì mỗi file được diff riêng. Một
  dòng mà GitHub không hiển thị ở đó sẽ qua được phép kiểm và bị GitHub từ chối, khi đó không gì được
  đăng và script thoát `3`.

## Phương án bị loại

- **Một khối shell trong `shared/ticket-adapters.md`, như khối mask.** Nhỏ hơn và không cần ADR,
  nhưng session vẫn phải tự dựng JSON và tự kiểm anchor, đúng phần việc mà finding nêu ra. Maintainer
  loại phương án này ngày 2026-11-19.
- **Mỗi inline comment một lần gọi.** Mỗi comment thành công hay thất bại riêng, nhưng bản tóm tắt
  và event đến tách rời, và pull request sẽ có nhiều review đăng dở khi một lần gọi lỗi giữa chừng.
