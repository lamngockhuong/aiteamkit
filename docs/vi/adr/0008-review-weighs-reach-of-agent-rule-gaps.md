---
title: "ADR 0008: atk:review cân nhắc lỗ hổng trong luật cho agent hay gặp đến đâu, và một lần sửa để trạng thái chưa có luật cho một quy tắc mặc định"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-10-21
updated: 2026-10-21
ticket: none
---

Approved by Lam Ngoc Khuong on 2026-10-21, by instruction to the agent. Returned to `IN REVIEW` on
2026-10-21 by his instruction, to carry Q3 and Q4, answered during implementation, and approved again
by him the same day. Edited on 2026-10-21 by his instruction to carry Q5 to Q8 of the design,
answered on the review of PR #141, and kept `APPROVED`.

# ADR 0008: atk:review cân nhắc lỗ hổng trong luật cho agent hay gặp đến đâu, và một lần sửa để trạng thái chưa có luật cho một quy tắc mặc định

Design: `docs/records/design/261021-0450-review-severity-by-reach.md`

## Bối cảnh

`atk:review` xếp mức độ của một finding chỉ theo hậu quả của nó. Skill này cũng cấm bác một ứng viên
chỉ vì nó khó xảy ra, và điều đó đúng với code. Phần lớn luật của chính kit lại là văn xuôi để agent
làm theo. Lỗ hổng trong loại luật này được xác nhận chỉ bằng cách đọc, nên nó lên tới `SHOULD FIX`
dù hiếm ai gặp. Mục `Fix` của mỗi finding là một thay đổi cụ thể. Với một trạng thái chưa được định
nghĩa, thay đổi đó là thêm một mệnh đề. Vòng review và sửa thì sửa mọi `SHOULD FIX`.

Ở PR #139, điều này dẫn tới bốn vòng review. Hai lần, finding `BLOCKING` của vòng sau sinh ra từ một
cách sửa được gợi ý và làm đúng y như vậy. `plugins/atk/shared/run-trace.md`, file mọi lượt chạy đều
đọc, đã tăng từ 21.028 lên 24.781 byte.

## Quyết định

- Một finding về luật viết cho agent mang nhãn `Reach: ordinary` hoặc `Reach: edge`. Finding `edge`
  là `NIT`, trừ khi hậu quả của nó thuộc năm loại kit không bao giờ chấp nhận:
  - quyết định hay phê duyệt của một vai trò bị đưa ra mà không có người sở hữu nó;
  - bí mật hay dữ liệu của một người bị lộ;
  - một hành động vượt quá ranh giới đồng ý;
  - lịch sử hay phần việc chưa commit bị mất;
  - một hợp đồng công khai bị phá vỡ.

  Năm loại này nằm cố định trong `review/SKILL.md`, là mức sàn của kit. Dự án muốn thêm hậu quả
  của riêng mình thì ghi một luật kèm mức độ vào review checklist của dự án, và Reach không bao giờ
  hạ mức độ đó. Tình huống đã thấy trong một lượt chạy thật là `ordinary`, không có mức thứ ba.
  Code giữ nguyên cách xếp mức độ hiện nay.
- Luật 5 của `shared/team-roles.md` có thêm một quy tắc mặc định cho trạng thái không luật nào phủ
  tới: nói ra điều đó, hỏi người đang chạy skill khi câu trả lời thuộc về họ, nếu không thì hỏi người
  mà luật 3 giao quyết định đó, ghi một câu hỏi mở mang tên người đó khi họ không có mặt trong phiên,
  và dừng lại khi không có ai để hỏi. Trên luật mà một lượt chạy `atk` làm theo, lỗ hổng mà quy tắc
  mặc định đã xử lý đúng thì không phải là finding. File agent của chính dự án không có quy tắc mặc
  định này, nên lỗ hổng ở đó được xếp theo mức độ hay gặp, và `ordinary` tính theo những người làm
  việc theo luật đó.
- Mục `Fix` của một finding có ba dạng: sửa câu sai, để cho quy tắc mặc định bằng cách bỏ câu đoán
  mò cho một trạng thái mà quy tắc mặc định đã trả lời đúng, hoặc thêm luật. Câu sai mà chính nó là
  câu đoán mò như vậy, khi quy tắc mặc định trả lời đúng, thì bị bỏ đi chứ không viết lại. Chỉ thêm
  luật khi quy tắc mặc định trả lời sai trong trường hợp thường gặp, hoặc trong bất kỳ trường hợp nào
  có hậu quả thuộc năm loại trên, hoặc khi một trạng thái trong file agent không thuộc quyền chi phối
  của luật 5 cần một câu trả lời mà file chưa có, và luật được thêm phải nêu những trạng thái mới mà
  chính nó mở ra.
- `atk:fix` và vòng review và sửa chọn dạng đầu tiên xóa được finding. Cách sửa được gợi ý chỉ là gợi
  ý, và bản ghi nêu dạng đã chọn.

## Hệ quả

- Ít finding `SHOULD FIX` hơn trên luật cho agent, và mỗi vòng sửa thêm ít mệnh đề hơn. Đây là kỳ
  vọng, chưa được đo.
- Mỗi lượt chạy đọc thêm khoảng 400 byte, nằm trong luật 5.
- Người review phải đánh giá mức độ hay gặp, và có thể đánh giá sai. Finding nào không đánh giá được
  thì tính là `ordinary`. Như vậy một lần đánh giá sai chỉ tốn thêm một `SHOULD FIX`, thay vì để một
  lỗi lọt qua ở mức `NIT`.
- Báo cáo cũ không có `Reach`, nghĩa là chưa được đánh giá.

## Phương án bị loại

- **Chỉ sửa `atk:fix` và vòng sửa.** Cách xếp mức độ vẫn sai. Mỗi `SHOULD FIX` người sửa từ chối sẽ
  thành một tranh chấp mà Tech Lead phải phân xử.
- **Giới hạn số finding một lần review, hoặc chỉ cho một vòng.** Giới hạn bỏ finding theo số lượng,
  không theo mức nặng nhẹ. Finding `BLOCKING` của lần review lúc 04:08 là một trong 58 finding.
- **Không làm gì, chờ run trace lộ ra lỗ hổng.** Một lần phê duyệt sai người chỉ được phát hiện sau
  khi nó đã xảy ra trong một team.
