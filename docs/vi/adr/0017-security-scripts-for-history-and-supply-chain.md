---
title: "ADR 0017: atk:security mang các script Node cho quét lịch sử và chuỗi cung ứng"
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-08
updated: 2026-11-09
ticket: none
---

Approved by Lam Ngoc Khuong on 2026-11-09, by instruction to the agent.

# ADR 0017: atk:security mang các script Node cho quét lịch sử và chuỗi cung ứng

Design: `docs/records/design/261108-2243-security-scripts.md`

## Bối cảnh

`atk:security` đọc code tại một commit. Một secret đã bị xoá khỏi cây vẫn nằm trong lịch sử của mọi clone, và record
chỉ có thể nói lịch sử chưa được quét, trừ khi project tình cờ chạy một history scanner. Chuỗi cung ứng CI, gồm action
được pin vào một tag di động, `pull_request_target`, văn bản lấy từ event đưa vào một shell step, install script, và
một chỉ mục package thứ hai, được nêu trong checklist của skill nhưng không có gì kiểm tra. Trước khi một repository
được giao cho khách hàng, người nhận nhận toàn bộ lịch sử của nó, kèm email nhân viên và host nội bộ nằm trong đó,
và chưa skill nào nhìn vào.

Kiểm tra xác định hiện có của kit là một block `sh`, `shared/secret-scan.md`, và các script Node của `atkx`,
theo điều kiện của ADR 0002. Chưa skill `atk` nào có script; người bảo trì cho phép ngày 2026-10-14, và đây là
cái đầu tiên đi kèm một design và một ADR.

## Quyết định

`atk:security` mang `scripts/`: `history-scan.mjs` duyệt mọi commit của mọi ref để tìm dạng bí mật
và file credential, và khi có `--identities` thì tìm email nhân viên và host nội bộ;
`supply-chain-scan.mjs` đọc workflow, manifest và lockfile đã được track. Cả hai import
`scripts/lib/secret-shapes.mjs`, chỉ dùng thư viện chuẩn của Node và `git`, in một đối tượng JSON,
không bao giờ in một giá trị khớp hay hash của nó, không gọi mạng, và thoát với `0` khi xong, `3` khi chạy dở,
`2` khi không chạy được. Phán đoán một kết quả có nghĩa gì nằm trong references:
`references/supply-chain.md` và `references/delivery-readiness.md`.

Các dạng bí mật được chép trong module và được giữ bằng với `shared/secret-scan.md` bởi một check trong
`tests/verify.sh`, check này chạy cả hai trên cùng các dòng và so nhãn; cũng vậy với cách scan đó xử lý
các file mà rule 9 nêu tên, phần mà lượt duyệt lịch sử không bao giờ đọc. Lượt duyệt yêu cầu git một dạng diff
duy nhất bất kể người dùng cấu hình gì, các option mà scan `sh` vẫn dùng, và đọc các commit merge
đối chiếu với mọi parent.

Một flag mới, `--delivery`, chạy cả hai script trên toàn bộ repository với `--identities`, các domain nội bộ
được truyền vào hoặc đề xuất từ lịch sử rồi người dùng xác nhận, và kết thúc bằng `READY` hoặc
`NOT READY` cùng các lựa chọn của người phụ trách, không chạy lựa chọn nào. Nó ở `NOT READY` cho tới khi người phụ trách
xác nhận rằng các ref mà lượt duyệt đã đi qua là tất cả những gì sẽ được bàn giao, vì một clone chỉ giữ những gì đã
được fetch. Report của nó được ghi vào một thư mục nằm ngoài git nhờ một file ignore riêng, không bao giờ vào
repository đang được bàn giao, còn stdout, thứ mà phiên đọc, không mang host đầy đủ hay phần local part của email
nào.

## Hệ quả

- `atk:security` là skill `atk` đầu tiên có script. `CLAUDE.md` và `docs/system-architecture.md`
  không còn nói chưa skill nào có.
- Các dạng nằm ở hai nơi, được giữ bằng một check theo hành vi, giống cách các bản sao của `atkx:doc-audit`
  được giữ bằng một check theo văn bản.
- Lịch sử được quét ở mọi lần chạy có Node, nên "lịch sử chưa quét" thành ngoại lệ, và một secret chỉ có
  trong lịch sử là Critical cho tới khi người phụ trách thu hồi nó.
- `plugins/atk/shared/artifact-paths.md` thêm một dòng derived cho report bàn giao.
- Danh sách tên gói phổ biến, `references/popular-packages.tsv`, cần được người bảo trì làm mới;
  script in ra ngày cũ nhất mà nó đã dùng.
- Một host không có Node mất cả hai lượt quét, và record nói như vậy.

## Các phương án bị loại

- **Block `sh`, như secret scan.** Chúng dùng lại các dạng mà không phải chép, nhưng không đọc được YAML, JSON
  hay TOML, không đo được khoảng cách chỉnh sửa, và không báo được một lượt duyệt dở. Người bảo trì loại ngày
  2026-11-08.
- **Chỉ các scanner mà project đã chạy.** Không phải xây gì, nhưng hầu hết project không chạy cái nào, và hai
  project có chạy thì nhận hai đáp án khác nhau cho cùng một câu hỏi.
- **Đọc các dạng từ `shared/secret-scan.md` lúc chạy.** Chỉ có một bản, nhưng một lần sửa văn xuôi trong file
  Markdown sẽ làm hỏng scan ở mọi project mà không có test nào chạy giữa chừng.
- **Report bàn giao là một phần của record bảo mật.** Record được commit vào repository đang được bàn giao,
  nên khách hàng nhận danh sách những gì rò rỉ cùng với rò rỉ đó.
