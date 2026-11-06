---
title: "ADR 0015: Trigger của skill viết bằng tiếng Anh, còn trigger eval giữ ba ngôn ngữ"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-06
updated: 2026-11-06
ticket: none
---

# ADR 0015: Trigger của skill viết bằng tiếng Anh, còn trigger eval giữ ba ngôn ngữ

Phép đo: mục "Đo trigger chỉ có tiếng Anh" trong `docs/trigger-eval-measurement.md`.

## Bối cảnh

Mọi `description:` của cả hai plugin từng liệt kê trigger bằng tiếng Anh, tiếng Việt và tiếng Nhật,
vì các team mà kit phục vụ hỏi bằng cả ba ngôn ngữ. Quy định này dựa trên một giả định chưa từng được
đo: yêu cầu tiếng Việt hay tiếng Nhật phải có cụm từ cùng ngôn ngữ trong description thì mới gọi tới
được skill.

Danh sách đó có cái giá của nó. Đếm theo ký tự, như `tests/verify.sh` đếm một description, danh sách
trigger, từ `Triggers on` đến hết và tính cả các cụm tiếng Anh, chiếm 6.989 trong 19.866 ký tự
description của 25 skill `atk`, và luôn nằm ở cuối. Claude Code cắt bớt description trong danh sách
skill, ở 1.536 ký tự mỗi skill, mức mà không description nào của kit chạm tới vì `tests/verify.sh` giữ
mỗi cái trong 1.024, và cắt ngắn hơn nữa khi cài nhiều skill, đó mới là lần cắt chạm tới danh sách
trigger. Trong một phiên có khoảng 200 skill, danh sách chỉ giữ nguyên
`atk:estimate`, cắt chín description ở giữa danh sách trigger, và cắt mười lăm description trước khi
danh sách trigger bắt đầu.

## Quyết định

- `description:` chỉ liệt kê trigger bằng tiếng Anh. Yêu cầu tiếng Việt hay tiếng Nhật đến được
  skill nhờ nghĩa của description tiếng Anh.
- `evals/trigger_evals.json` có case dương bằng tiếng Anh, tiếng Việt và tiếng Nhật, kể cả của skill
  mới, và `tests/verify.sh` báo lỗi file nào thiếu case dương tiếng Việt hoặc tiếng Nhật. Đó là phép
  kiểm tra rằng description tiếng Anh vẫn gọi tới được từ yêu cầu ở hai ngôn ngữ đó.
- Khi phép đo cho thấy một case như vậy bị trượt, ta sửa description tiếng Anh cho rõ hơn rồi đo lại.
  Thêm lại cụm từ kia không phải cách sửa đầu tiên: khi không cách viết tiếng Anh nào gọi tới được
  case đó mà không lấn sang case dương của skill bên cạnh, Tech Lead chọn giữa một cụm bằng ngôn ngữ
  đó trong riêng description ấy và một case hẹp hơn, và phép đo ghi lại đã chọn gì.

## Bằng chứng

Đo ngày 2026-11-06 bằng bộ chạy trigger của `atkx:skill-eval`, model sonnet, Claude Code 2.1.319,
mỗi case hai lần: 64 case tiếng Việt và tiếng Nhật của `review`, `qa` và `fix`, chạy với ba bản của
cả 25 description. Bản ba ngôn ngữ, bản chỉ tiếng Anh, và bản rút gọn còn ba cụm mỗi ngôn ngữ đặt
sau câu đầu tiên lần lượt gọi đúng skill ở 68, 68 và 70 trên 74 lượt dương, và cả ba đều tránh đúng ở
toàn bộ 54 lượt âm. Chênh lệch chỉ một hai lượt, nhỏ hơn mức mà hai lần chạy mỗi case phân biệt được.
22 description `atk` còn lại và cả hai description `atkx` đã đổi mà không chạy eval của chính chúng;
một issue theo sau giữ lần đo đó.

## Hệ quả

- Description của 27 skill trong hai plugin ngắn đi 3.396 ký tự, đếm cùng cách: đó là các cụm tiếng
  Việt và tiếng Nhật đã bỏ, khác với cả danh sách được đếm ở trên, nên khi danh sách đông thì mỗi
  description bị cắt ít hơn.
- Team hỏi bằng tiếng Việt hay tiếng Nhật giờ dựa vào trigger eval thay cho cụm từ trong description,
  nên một lần sửa description làm rớt các case đó chỉ bị phát hiện khi có người chạy phép đo. Yêu
  cầu không gọi tới skill nào thì không để lại run trace, nên team thấy một lần trượt thì báo tay,
  bằng một issue ghi yêu cầu và skill nó nhắm tới.
- Kết quả thuộc về sonnet và ba skill. Model nhỏ hơn, hoặc cặp skill có ranh giới hẹp hơn, có thể cần
  phép đo riêng trước khi rút gọn description thêm.

## Phương án bị loại

- **Giữ danh sách ba ngôn ngữ.** Đo không tốt hơn, lại tốn nhiều ký tự nhất, đúng phần hay bị cắt
  nhất.
- **Danh sách rút gọn ba cụm mỗi ngôn ngữ sau câu đầu tiên.** Đo tốt nhất, hơn hai lượt, trong mức
  nhiễu, nhưng mỗi description vẫn phải duy trì thêm ngôn ngữ thứ hai và thứ ba.
