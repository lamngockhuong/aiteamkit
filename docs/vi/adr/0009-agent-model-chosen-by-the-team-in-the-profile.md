---
title: "ADR 0009: Team chọn model cho các agent mà atk sinh ra, qua profile"
status: IN REVIEW
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-22
updated: 2026-10-22
ticket: none
---

# ADR 0009: Team chọn model cho các agent mà atk sinh ra, qua profile

Design: `docs/records/design/261022-0830-agent-model-from-profile.md`

## Bối cảnh

Không skill hay agent nào của `atk` ghi tên model, nên mọi agent do skill sinh ra đều chạy trên model
mà harness chọn, thường là model của phiên. Chi phí của một lần chạy nhân lên ở các agent: review sinh
một agent cho mỗi vòng, nhiều hơn nữa khi có `--parallel`; challenge sinh một agent cho mỗi lens; bảy
skill giao phần đọc rộng cho một agent. Theo tài liệu đọc ngày 2026-10-22, cả Claude Code, Cursor và
Codex đều cho bên gọi ghi tên model khi sinh agent. Chọn model rẻ hơn là đánh đổi giữa chi phí và
những gì review tìm ra. Quyết định đó thuộc về một vai trò, không thuộc về kit.

## Quyết định

Thêm hai dòng tuỳ chọn vào phần Team của `.atk/profile.md`: `Reading agent model` và
`Review agent model`. Mỗi dòng là một danh sách cặp `<harness> <model>`, hoặc `inherit`. Khi sinh một
agent thuộc loại đó trên harness đó, skill truyền model được ghi. Thiếu dòng hoặc dòng không nhắc tới
harness đang chạy thì skill không truyền gì. Lần chạy ghi model đã yêu cầu ngay cạnh số agent nó sinh
ra. Harness nào không nhận model lúc sinh agent thì vẫn sinh như hiện nay, và lần chạy nói rõ dòng đó
không được áp dụng.

Ba thứ không bao giờ chịu ảnh hưởng: model của phiên, reviewer band 1 của `atk:review`, và mọi agent
ghi file, tức các job của `atk:orchestrate`. Kit không mang theo tên model nào và không kiểm tra tên
nào.

## Hệ quả

- Dự án không ghi gì thì chạy y như hiện nay trên mọi harness.
- Team có thể hạ chi phí của phần đọc rộng mà không đụng tới review, hoặc hạ cả hai, chỉ bằng cách sửa
  profile; xoá dòng là quay lại như cũ.
- Trên Claude Code và Codex, model truyền lúc sinh agent được ưu tiên hơn mặc định cho subagent mà một
  người tự đặt. Điều này chỉ xảy ra với agent của kit, và chỉ khi team đã ghi model cho harness đó.
  Dòng nêu tổng số agent cho thấy điều đó.
- Chưa ai đo xem model review rẻ hơn có bỏ sót finding không; design để ngỏ câu hỏi này cho Tech Lead.
- Cursor có tôn trọng model truyền lúc sinh agent hay không mới có trong tài liệu, chưa được đo ở đây.

## Các phương án bị loại

- **Chỉ ghi tài liệu về mặc định cho subagent của harness, không sửa skill nào.** Một giá trị áp cho
  mọi subagent, kể cả các agent viết code của `atk:orchestrate`, nên không thể hạ model cho phần đọc
  mà không hạ luôn chúng; Cursor cũng không có mặc định như vậy trong tài liệu. Ở chỗ profile không
  nói gì, mỗi người vẫn dùng được cách này.
- **Đóng gói thêm một agent chỉ đọc có model rẻ hơn trong frontmatter.** Khi đó kit tự chọn model,
  tên model không có nghĩa gì trên Cursor hay Codex, và sẽ lỗi thời sau mỗi đợt phát hành model.
- **Thêm trường `model:` vào từng `SKILL.md`.** Kit sẽ tự chọn, và trên Claude Code trường này đổi
  luôn model của phiên trong lượt đó, đè lên lựa chọn của người dùng.
