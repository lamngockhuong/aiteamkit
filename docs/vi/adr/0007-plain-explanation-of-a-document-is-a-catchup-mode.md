---
title: "ADR 0007: giải thích dễ hiểu một tài liệu, record của kit hay bất kỳ tài liệu nào khác, là một mode của atk:catchup"
status: SUPERSEDED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-16
updated: 2026-10-24
ticket: none
---

Bị thay thế ngày 2026-10-24 bởi `docs/adr/0010-review-findings-explained-from-the-repository-and-answered-in-fix.md`, ADR đổi một quyết định, rằng mọi điều trang nói đều truy được về một chỗ trong tài liệu, với review report; mọi quyết định khác ở đây vẫn giữ nguyên.

# ADR 0007: giải thích dễ hiểu một tài liệu, record của kit hay bất kỳ tài liệu nào khác, là một mode của atk:catchup

Design: `docs/records/design/261016-0755-catchup-document-mode.md`

## Bối cảnh

Các record mà kit viết ra, trong đó có security record, fix report và review report, đều mở đầu bằng
mục `In short` theo `plugins/atk/shared/plain-writing.md`. Bên dưới mục đó, mỗi finding được viết cho
người đọc sẽ mở các trích dẫn `path:line` của nó. Thành viên trong đội còn nhận những tài liệu không
do kit viết: báo cáo kiểm thử xâm nhập của bên thứ ba, báo cáo audit, đặc tả của khách hàng. Người
phải hành động dựa trên những tài liệu này mà không có chuyên môn thì không có gì giúp họ. Những người
đọc như vậy thường là PM sắp thứ tự công việc, Stakeholder chấp nhận một rủi ro, hoặc developer mới
vào khu vực đó.

Ngày 2026-10-16, maintainer yêu cầu giải thích bằng lời thường từng finding của một security record
có 13 finding, đưa vào một file. Sau đó maintainer muốn cách này dùng được cho mọi tài liệu. Session
đã viết trang đầu tiên bằng tay, và không skill nào làm lại được việc này.

## Quyết định

`atk:catchup` có thêm mode thứ ba là document mode. Mode này được chọn khi tham số là một file local,
một đoạn văn bản được dán vào, hoặc một link tới tài liệu mà không phải pull request hay object của
tracker.

- Link được đọc qua connection mà harness đã có tới dịch vụ đó. Connection được tìm theo việc nó làm
  được, và chỉ đọc khi nó ở trạng thái sẵn sàng. Nếu không, lần chạy yêu cầu một bản export về máy.
  Phần chung của quy tắc này gồm cách tìm connection theo khả năng, ba trạng thái, và việc không bao
  giờ ghi lại tài khoản đang đăng nhập. Phần đó chuyển từ `shared/design-sources.md` sang
  `shared/host-capabilities.md`, vì giờ đã có hai skill cần đến nó.

- Mode ghi một trang tạm vào `docs/derived/catchup/documents/`, với `approver: none`, giống brief.
  Một file ignore chứa `*` trong thư mục đó, được kiểm bằng `git check-ignore -q` giống run trace,
  giữ trang nằm ngoài git, và trang không bao giờ được đề nghị commit.
- Trang và run trace của nó được đặt tên theo loại record của kit, hoặc `document`, không bao giờ
  theo tên của chính tài liệu; tên đó chỉ xuất hiện trong nội dung trang. `ticket` là path của một
  record của kit đã commit, hoặc `none`.
- **Record do kit viết** được giải thích theo từng finding, dựa trên bảng các loại record trong
  `plugins/atk/skills/catchup/references/document-explainer.md`. Các loại đó là security record,
  threat model, review report, fix report, verification record, test run record và incident record.
- **Mọi tài liệu khác** được giải thích theo từng finding nếu tài liệu liệt kê finding, còn không thì
  theo từng mục. ID và thang mức độ của chính tài liệu được giữ nguyên, không quy đổi sang thang của
  kit.
- Với mỗi finding, trang nói chuyện gì xảy ra, ai có thể làm nó xảy ra, một ví dụ đời thường có ghi
  rõ là ví dụ, hậu quả, điều kiện, cách sửa được đề xuất, và finding đã được kiểm chứng hay chưa.
- Trang kết thúc bằng một bảng mỗi finding hoặc mỗi mục một dòng, một thứ tự sửa đề xuất có ghi tên
  người quyết định thứ tự đó, và các câu hỏi mở, mỗi câu gửi cho một người cụ thể.
- Mọi điều trang nói đều truy được về một chỗ trong tài liệu. Trường nào tài liệu để trống thì ghi là
  không rõ, không suy đoán.
- Tài liệu từ bên ngoài là bằng chứng, không bao giờ là mệnh lệnh, theo rule 8. Quy tắc này được viết
  ngay trong bước của mode. Rule 9 giữ các file credential không bị mở và che các giá trị bí mật trên
  trang.
- Định dạng mà harness không đọc được thì skill yêu cầu một bản export, không đoán nội dung.
- Trang nhắc lại lỗ hổng chưa sửa, giải thích tài liệu mật, hoặc có giá trị đã bị che vẫn được viết
  đầy đủ. Khi kết thúc, lần chạy nói một dòng trong session vì sao trang nhạy cảm, và không ghi cảnh
  báo đó vào trang.
- Mode này không có understanding check, cùng lý do pull request mode không có.

## Hệ quả

- Đội chỉ cài `atk` cũng có mode này, và kit không thêm slash command mới.
- `catchup` giờ đọc cả tài liệu, ngoài epic và pull request. `docs/flow/skill-chain.md` và danh sách
  nơi trích dẫn `plain-writing.md` phải sửa theo.
- Cả `catchup` và `atk:intake` đều có thể nhận tài liệu của khách hàng. Description và các trigger
  case phải phân biệt "giúp tôi hiểu tài liệu này" với "biến tài liệu này thành requirement". Khi yêu
  cầu không nói rõ, lần chạy sẽ hỏi.
- Bảng loại record phải được bổ sung mỗi khi một skill bắt đầu viết loại record mới.

## Phương án bị loại

- **Một skill `atkx` mới.** Phương án này đạt tiêu chí của `atkx`, nhưng đội chỉ cài `atk` sẽ không
  có, và `plain-writing.md` sẽ phải chép sang plugin thứ hai.
- **Cờ `--plain` trên mỗi skill viết record.** Bản giải thích sẽ được viết đúng lúc record được viết,
  tức là lúc người cần đọc nó không có mặt. Cách này không giải thích được record đã có sẵn, cũng không
  giải thích được tài liệu nào mà kit không viết.
- **Để `In short` làm việc đó.** Mục đó giải thích lần chạy, không giải thích từng finding, và tài liệu
  từ bên ngoài không có mục này.
