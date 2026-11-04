---
title: "ADR 0012: atkx:doc-audit kiểm từng nhận định của một tài liệu với nguồn của nó"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-03
updated: 2026-11-03
ticket: none
---

Approved by Lam Ngoc Khuong on 2026-11-03, by instruction to the agent.

Đánh lại số từ ADR 0011 thành ADR 0012 ngày 2026-11-03, trước khi merge, có sự đồng ý của người duyệt, vì trong lúc đó `main` đã dùng số ADR 0011; quyết định giữ nguyên.

# ADR 0012: atkx:doc-audit kiểm từng nhận định của một tài liệu với nguồn của nó

Design: `docs/records/design/261103-1035-atkx-doc-audit.md`

## Bối cảnh

Các team giữ những tài liệu do agent viết mà chưa ai kiểm. Nhờ một agent khác review một tài liệu như
vậy chỉ nhận lại ý kiến rằng nó đọc có trôi không, chứ không biết nó có đúng không, vì không có gì
được đem ra so. Một lượt chạy thử trên ba tài liệu của một dự án khách hàng đã kiểm từng nhận định với code, và tìm
ra 29 trong 132 nhận định sai, 22 cái trong đó nằm ở một tài liệu tự nhận là nguồn chuẩn. Trong khi
đó, mỗi tài liệu chỉ có hai tới bốn nhận định không có nguồn trong repository.

Hiện chưa skill nào làm được điều này. `atk:spec --check` so bốn loại tài liệu tham chiếu với code;
`atk:catchup` giải thích một tài liệu mà không đánh giá nó; các mode `--challenge` của
`atk:design-doc` và `atk:plan` thử bản nháp của chính kit trước khi review.

## Quyết định

Một skill mới trong plugin `atkx`, `doc-audit`. Skill này liệt kê mọi nhận định kiểm được của một tài
liệu và cho mỗi nhận định một kết luận: `CORRECT` hoặc `WRONG`, mỗi kết luận kèm một `path:line` hoặc
một nguồn được trích, hoặc `UNVERIFIABLE`, kèm nguồn sẽ quyết được nó và người phải trả lời. Skill liệt
kê các mâu thuẫn bên trong từng tài liệu và giữa các tài liệu. Mọi kết luận `WRONG`, và một mẫu bằng
một phần mười số kết luận `CORRECT`, được đọc lại bởi một agent không thấy lập luận của agent thứ
nhất; tỉ lệ mẫu được chốt ở câu hỏi mở 1 của design.

Khi nhận một thư mục, skill chạy trước một lượt quét chi phí thấp không đọc code: một script Node kiểm
mọi trích dẫn, và một agent đọc từng tài liệu để tìm chỗ tự mâu thuẫn. Sau đó skill xếp hạng các tài
liệu, và một người chọn tài liệu nào được kiểm đầy đủ.

`--red-team` thêm phản bác cho những gì không nguồn nào quyết được, từ các agent đọc tài liệu mà không
biết gì trước về nó, mỗi agent xét tài liệu có thể thất bại theo một kiểu riêng, và giữ các phản bác ở một mục tách
khỏi các kết luận.

Skill không thay đổi tài liệu nào, chỉ đọc bên trong repository chứa các tài liệu, và không lấy về
địa chỉ nào ngoài issue của chính repository đó. Mọi dòng được trích đều được che giá trị bí mật.
Report của nó nằm ở `<docs root>/derived/doc-audit/`, chỉ được ghi khi path thật nằm trong repository
và `git check-ignore` xác nhận git bỏ qua nó; nếu không, report được ghi vào một thư mục dưới thư mục
tạm mà chỉ người dùng đọc được. `--out` chịu đúng các bước kiểm đó. Một tài liệu thuộc loại mà
`atk:spec` quản lý được kiểm như mọi tài liệu khác, và report nêu `atk:spec --check` mà không gọi nó.

## Hệ quả

- `atkx` có thêm skill thứ hai có script, `cite-check.mjs` và `tally.mjs`, theo điều kiện của ADR 0002.
- `atkx` mang bản sao của bốn phần trong `atk` mà nó cần lúc chạy: bảng path không được đọc của
  `plugins/atk/shared/secret-scan.md`, quy tắc che giá trị, lấy từ bảng các loại dữ liệu của
  `plugins/atk/skills/qa/references/test-run.md` và dòng che giá trị trong mục What happens on a hit
  của `plugins/atk/shared/secret-scan.md`, các quy tắc prompt cho agent của
  `plugins/atk/shared/host-capabilities.md`, và các quy tắc challenge của
  `plugins/atk/shared/independent-challenge.md`. Mỗi bản sao nêu nguồn gốc bằng link GitHub, vì
  `tests/verify.sh` từ chối một file plugin nêu path của plugin khác, và một bước kiểm mới ở đó báo
  lỗi khi một bản sao khác với bản gốc.
- `atk` thay đổi ở một chỗ: một dòng trong `plugins/atk/skills/help/references/atkx-skills.md`. Dòng
  này được phát hành trong package `atk`, nên bản phát hành `atkx` được merge trước, và khi hoàn tác
  thì thứ tự đảo lại.
- `--red-team` và `atk:design-doc --challenge` đều đặt các agent không biết gì trước vào phản bác một
  tài liệu. Chúng khác nhau ở đối tượng và góc nhìn: một bên nhắm mọi tài liệu đã viết, theo cách nó có
  thể thất bại; bên kia nhắm một bản nháp `atk`, theo vai trò ký duyệt. Người đọc vẫn có thể nhầm hai
  cái, nên `atk:help` nói rõ cái nào là cái nào.
- Report trích các dòng của tài liệu và nêu tên người, nên nó được giữ ngoài git và ngoài repository
  này.
- Kiểm hàng trăm tài liệu với chi phí đầy đủ là không kham nổi; lượt quét chi phí thấp quyết định tiền
  được chi vào đâu, và các tín hiệu xếp hạng của nó chỉ dựa trên một lượt chạy thử cho tới khi lần chạy
  thứ hai kiểm chúng.

## Các phương án bị loại

- **Mở rộng `atk:spec --check` cho mọi tài liệu.** Quy tắc độ lệch của nó giả định khuôn và trường
  `implemented` của một tài liệu tham chiếu; một ghi chú yêu cầu không có code nào để lệch khỏi, còn
  một design vốn được viết để lỗi thời. Sáu skill trích hợp đồng đó.
- **Một skill `atk` mới với record được commit.** Một lượt kiểm là bản đọc trước một quyết định, không
  phải một quyết định; một record cần duyệt sẽ đặt thêm một artifact trước team ở mỗi lần chạy, trong
  khi nó không thuộc giai đoạn delivery nào.
- **Chỉ có chỉ dẫn, một trang trong `docs/`.** Lượt chạy thử cần cùng một prompt ba lần, một lần đếm lại
  và một lần đọc lại mọi kết luận sai; với một trang, mỗi bước như vậy chỉ còn trông vào trí nhớ.
- **Chỉ kiểm lại, không có `--red-team`.** Đã được cân nhắc; người bảo trì chọn thêm cờ này ngày
  2026-11-03, cho những tài liệu có lập luận mà không nguồn nào kiểm được.
