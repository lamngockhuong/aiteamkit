---
title: "ADR 0016: Một lần chạy không người trực của atk:orchestrate đi qua tạm các cổng đủ điều kiện, không bao giờ trả lời chúng"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-08
updated: 2026-11-08
ticket: none
---

Approved by Lam Ngoc Khuong on 2026-11-08, by instruction to the agent.

# ADR 0016: Một lần chạy không người trực của atk:orchestrate đi qua tạm các cổng đủ điều kiện, không bao giờ trả lời chúng

Design: `docs/records/design/261108-1246-orchestrate-unattended-run.md`. Requirement:
`docs/records/requirements/261105-0310-auto-run-with-batched-decisions.md`.

## Bối cảnh

Một lần chạy dài của `atk:orchestrate` đứng lại ở mọi cổng khi không ai theo dõi: cổng dành cho người
không có trong session sẽ park chain của nó, và trong lúc đó không gì được xây. Yêu cầu ban đầu muốn
để agent quyết định nhân danh Tech Lead hay PM, điều phá ba luật mà kit dựa vào: duyệt là hành động
của người duyệt (luật 2 của `plugins/atk/shared/team-roles.md`), không skill nào ghi một quyết định
team chưa đưa ra (luật 3), và một skill điều phối chuyển cổng chứ không bao giờ trả lời nó
(`plugins/atk/shared/host-capabilities.md`, "A gate is relayed, never answered"). Thay vào đó,
maintainer chọn một dạng trong đó agent chỉ đề xuất, run đi tiếp tạm, và về sau một người quyết định
từng cổng như vậy, và đã trả lời sáu câu hỏi của requirement ngày 2026-11-05.

## Quyết định

`atk:orchestrate` thêm `--unattended`. Với cờ này, một cổng thuộc bảng điều kiện cố định, gồm một
phương án trong bản nháp không đổi phạm vi, xác nhận plan gate mức medium của một fix job, hoặc việc
chờ duyệt một artifact gating, được đi qua tạm khi, và chỉ khi, mọi lens agent của các vai trò sở hữu
nó chọn, từ đầu và không thấy đề xuất, đúng phương án mà skill của job đề xuất. Job ghi câu hỏi là
còn mở dưới tên người sở hữu, kèm một dòng `Provisional:`, và cổng trở thành một mục trong hàng đợi
quyết định của run state. Mọi cổng khác, và mọi bất đồng, park chain như hiện nay. Một chain xây trên
tối đa một artifact gating chưa duyệt, và một run đi qua tạm tối đa tám cổng. Một mục bị từ chối được
làm lại từ commit gốc của nó dưới một proposal record mới đã duyệt; branch tạm được giữ làm bằng
chứng. Người nào trả lời một cổng trong session thì từ đó run có người trực, và run quay lại chế độ
không người trực khi người đó nói họ không còn trực nữa.

Luật nằm trong một file reference của `atk:orchestrate`. Các file dùng chung chỉ thêm những gì job,
skill và trace phải biết: một gạch đầu dòng trong `host-capabilities.md`, một mệnh đề trong luật 5,
một trường của dòng `stop:` của job, và kết quả `provisional` của dòng `gate` trong trace.

## Hệ quả

- Người vắng mặt trong một run quay lại thấy công việc đã được xây và một hàng đợi, thay vì các chain
  đang park.
- Không điều gì thuộc quyền một người bị agent quyết thay: không state nào bị đổi, không gì vượt
  consent line, và mọi bản ghi gọi lens agent là agent và câu trả lời của nó là đề xuất.
- Công việc xây trên một cổng tạm có thể bỏ đi. Một lần từ chối tốn công làm lại trên máy, và kit
  không bao giờ tự chạy lại khi không được yêu cầu.
- Tối đa 24 lens agent mỗi run, nêu trong proposal trước khi chạy.
- Permission prompt vẫn cần người. Trong chế độ này, job có cách chạy có thể bật prompt hoặc hết
  timeout (pane), hoặc chỉ được đề xuất khi người duyệt xác nhận nó sẽ không bật (subagent).
- Dòng `gate` của trace có kết quả thứ tư; `atk:tailor` đọc được mà không cần loại sự kiện mới.

## Các phương án bị loại

- **Agent quyết định nhân danh vai trò.** Yêu cầu ban đầu. Nó ghi những quyết định không ai đưa ra,
  luật 3, và một sự duyệt không ai cho, luật 2.
- **Cờ `--provisional` trên mỗi skill có cổng.** Một người có thể chạy riêng skill với cờ đó và đưa
  skill qua cổng của chính nó mà không ai kiểm tra, và job subagent không tạo được lens agent.
- **Park mọi thứ và chỉ gom các câu hỏi đang park lúc đóng run.** Giữ mọi luật nhưng không xây gì khi
  người vắng mặt, mà đó chính là nhu cầu.
- **Đi tiếp theo đa số lens agent.** Các agent trên cùng một model đồng ý với nhau không mấy ý nghĩa,
  và nghiêng về một lens là coi agent như vai trò.
- **Một file ủy quyền duyệt trước cho agent chọn ở một số cổng.** Đã cân nhắc trong buổi phỏng vấn
  requirement và chưa chọn lúc này; một yêu cầu sau có thể thêm vào.
