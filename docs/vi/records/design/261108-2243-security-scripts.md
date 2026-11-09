---
title: atk:security scripts - lịch sử git, chuỗi cung ứng và độ sẵn sàng bàn giao
status: APPROVED
owner: Lam Ngoc Khuong
approver: Lam Ngoc Khuong
created: 2026-11-08
updated: 2026-11-09
ticket: none
---

Approved by Lam Ngoc Khuong on 2026-11-09, by instruction to the agent.

# atk:security scripts - lịch sử git, chuỗi cung ứng và độ sẵn sàng bàn giao

## Tóm tắt

`atk:security` chỉ đọc code tại một commit. Nó không đọc lịch sử, nơi một khoá đã xoá từ năm ngoái vẫn
nằm trong mọi bản clone. Chuỗi cung ứng CI có tên trong checklist nhưng không có phép kiểm nào chạy nó.
Trước khi giao repository cho khách hàng, những người sẽ nhận cả lịch sử đó, cũng không ai kiểm hai thứ này.
Design này cho `atk:security` hai script Node, và đây là `scripts/` đầu tiên trong một skill `atk`: `history-scan.mjs`
duyệt mọi commit của mọi ref để tìm dạng bí mật, file credential, và khi được yêu cầu thì cả email nhân viên
lẫn host nội bộ; `supply-chain-scan.mjs` đọc workflow CI, manifest và lockfile trong phạm vi. Cả hai in
JSON, không bao giờ in giá trị đã khớp, không gọi mạng, và báo lượt quét chưa xong là chưa xong. Phần phán
đoán nằm trong references: một kết quả nghĩa là gì so với các tài sản ở bước 1. Flag mới `--delivery` chạy
thêm phần quét lịch sử tìm định danh và host, kết thúc bằng `READY` hoặc `NOT READY`, liệt kê các lựa chọn
cho người chịu trách nhiệm và không tự chạy lựa chọn nào. Báo cáo của nó nằm ở chỗ git bỏ qua,
vì một báo cáo liệt kê những gì đang rò rỉ
thì không được giao đi cùng repository.

## Yêu cầu

Kế hoạch `plans/261108-2058-security-supply-chain-history-delivery/plan.md` (cục bộ, không commit), mục 1, các tiêu chí chấp nhận
do Lam Ngoc Khuong xác nhận ngày 2026-11-08. Design này trả lời:

- **AC6.** `atk:security` quét chuỗi cung ứng CI và dependency bằng một script Node, rồi phân loại từng phát hiện
  theo một reference riêng của nó.
- **AC7.** `atk:security` quét toàn bộ lịch sử git tìm secret bằng một script Node, báo commit, path, dòng và dạng,
  không báo giá trị, và báo `HEAD` còn giữ nó hay không.
- **AC8.** Một chế độ bàn giao kiểm tra một repository trước khi nó được giao cho khách hàng, và kết thúc bằng
  `READY` hoặc `NOT READY`, liệt kê các lựa chọn của người phụ trách mà không chạy lựa chọn nào.
- **AC9.** Mục 6 đến 8 đi theo một design đã duyệt và một ADR, vì chúng là `scripts/` đầu tiên
  trong một skill `atk`.

AC1 đến AC5 là hình dạng của record, do giai đoạn 1 giao (commit `ecaa39f` trên
`feat/security-record-reach-chains-titles`); design này dùng hình dạng đó và không đổi nó.

Đã quyết trước design này, bởi Lam Ngoc Khuong ngày 2026-11-08: kiểm tra bàn giao là một flag của `atk:security`,
không phải một bước của `atk:release`; các lượt quét lịch sử và chuỗi cung ứng là script Node có design và ADR,
không phải các block `sh`.

## Hiện trạng

- `plugins/atk/skills/security/SKILL.md:106` đến `:127`, bước 2 Kiểm tra tự động: dependency, secret scan trên các
  file đã track (`:118`), cấu hình. Không có gì đọc lịch sử hay workflow CI.
- `plugins/atk/skills/security/references/threat-checklist.md:104`: "Secrets in history" chỉ chạy khi project đã có sẵn
  một history scanner, nếu không thì record ghi rằng lịch sử chưa được quét. `:133`, dòng `A03:2025`, nêu các action
  đã pin, quyền của workflow và cách một secret đi vào một step; không kiểm tra nào tạo ra
  một trong số đó.
- `plugins/atk/shared/secret-scan.md:44` đến `:180` là lượt quét, một block `sh` có các dạng là biểu thức chính quy
  awk ở `:105` đến `:126`, còn các path tự nó đã là một phát hiện là các glob ở `:55` đến `:60`
  và bảng ở `:316`. `:370` nói rằng nó không thấy
  một secret đã nằm sẵn trong lịch sử.
- `plugins/atkx/skills/doc-audit/scripts/cite-check.mjs` đã chép lại một phần của file đó: bảng ở `:316` dưới dạng
  một mảng có đánh dấu, được `tests/verify.sh:289` đến `:299` giữ bằng với bản gốc. `tests/verify.sh:301` trở đi
  dựng fixture trong một repository tạm lúc chạy test, các giá trị không được phép rò rỉ được ghép từ từng mảnh,
  nên không file nào được commit chứa một giá trị thật.
- `plugins/atkx/skills/doc-audit/SKILL.md:160` chạy một script theo dạng `node <this skill>/scripts/<name>.mjs`;
  `docs/adr/0002-skill-eval-scripts-for-repeatable-checks.md` đặt các điều kiện: chỉ Node, chỉ cho những kiểm tra
  mà đáp án phải lặp lại, phán đoán nằm trong references, và một host không có Node được báo rằng nó mất những gì.
- `CLAUDE.md:136` đến `:140` và `docs/system-architecture.md:480`: một skill `atk` có thể mang `scripts/` từ
  ngày 2026-10-14, cái đầu tiên có design và ADR riêng; hiện chưa skill nào có.
- `plugins/atk/shared/artifact-paths.md:157`, dòng security: một record được commit dưới `docs/records/security/`.
  Một record ở đó được commit vào chính repository nó mô tả,
  tức là repository mà một bàn giao sẽ trao đi.
- `plugins/atk/shared/project-profile.md:180`: profile có bảy mục và không hơn, nên một danh sách domain của công ty
  không có chỗ trong đó nếu không đổi hợp đồng của file đó.

## Tiêu chí quyết định

1. **Lặp lại được.** Cùng một repository cho cùng kết quả ở mọi lần chạy và trên mọi harness.
2. **Không rò giá trị.** Không có gì mà script khớp được đi vào output, phiên làm việc hay một record.
3. **Chạy được ở mọi nơi kit chạy.** Windows, macOS, Linux, không cần công cụ mà project không có.
4. **Không gửi gì ra ngoài.** Dòng của record nói rằng không có request nào rời khỏi máy phải luôn đúng.
5. **Bảo trì.** Một nguồn cho mỗi quy tắc, và một check giữ nó khi buộc phải chép.
6. **Công sức.** Chi phí để xây và để review.

## Các phương án

### Phương án A: block `sh` trong references, như secret scan (lựa chọn mặc định)

Tiền lệ của kit cho một kiểm tra xác định là `shared/secret-scan.md`: một block `sh`, chạy được
ở mọi nơi. Một mode `history` sẽ đưa `git log -p --all` qua cùng chương trình awk. Nó dùng lại mọi
dạng mà không phải chép gì. Nó thua ở phần mà hai lượt quét còn lại cần: YAML của workflow, JSON và TOML
của lockfile, khoảng cách chỉnh sửa cho typosquat. Tất cả đều là một chương trình chứ không phải một đường ống,
và một chương trình awk trên lịch sử lớn không có cách nào báo một lượt duyệt dở ngoài mã thoát. Lam Ngoc Khuong
loại phương án này ngày 2026-11-08.

### Phương án B: dựa vào các scanner mà project đã có

Giữ nguyên phần mô tả: lịch sử bằng gitleaks hoặc trufflehog, workflow bằng zizmor, dependency bằng osv-scanner,
mỗi cái chỉ ở nơi project có chạy, như `threat-checklist.md:11` ghi hiện nay. Không có gì phải xây. Hầu hết
project không chạy cái nào trong số này, nên record cứ ghi "chưa quét", còn nơi nào có một cái chạy thì hai
project sẽ nhận hai đáp án khác nhau cho cùng một câu hỏi.

### Phương án C: hai script Node và một module dùng chung (được chọn)

`plugins/atk/skills/security/scripts/history-scan.mjs` và `supply-chain-scan.mjs`, cả hai import
`scripts/lib/secret-shapes.mjs`. Chỉ dùng thư viện chuẩn của Node và `git`, gọi bằng mảng đối số và không qua shell.
JSON trên stdout. Một scanner mà project đã có vẫn chạy bên cạnh và được nêu trong record; các script là sàn
tối thiểu, không phải thứ thay thế.

### Chấm điểm

| Tiêu chí | A: khối `sh` | B: scanner của dự án | C: script Node |
|-----------|----------------|---------------------|-----------------|
| Lặp lại được | Có với bí mật, không có parser cho phần còn lại | Không, khác theo từng công cụ | Có |
| Không rò giá trị | Có, theo quy tắc của chính scan | Tuỳ công cụ có in giá trị hay không | Có, được một test giữ |
| Chạy được ở mọi nơi | Cần `sh` và awk | Chỉ ở nơi đã cài | Cần Node, như các hook đang cần |
| Không gửi gì ra ngoài | Có | Một số công cụ tải advisory về | Có, được một test giữ |
| Bảo trì | Một bản chép các dạng | Không có gì ở đây | Các dạng được chép, được một check giữ |
| Công sức | Thấp cho lịch sử, cao cho phần còn lại | Không có | Trung bình |

## Cách tiếp cận được chọn: Phương án C

### Bố cục

```
plugins/atk/skills/security/
  scripts/history-scan.mjs        every commit of every ref: secrets, credential files, identities, hosts
  scripts/supply-chain-scan.mjs   workflows, manifests, lockfiles of the tracked tree
  scripts/lib/secret-shapes.mjs   the shapes and the credential-file globs, restated from shared/secret-scan.md
  references/supply-chain.md      triage of each candidate kind, and what the script cannot see
  references/delivery-readiness.md  the delivery triage table, the verdict rule, the owner's options
  references/popular-packages.tsv   names typosquat candidates are measured against, per ecosystem
tests/security-fixtures/          fixture inputs; the git histories are built at test time
```

### Điểm rẽ 1: các dạng bí mật lấy từ đâu

Được chép trong `scripts/lib/secret-shapes.mjs`, mỗi dạng kèm nhãn mà `shared/secret-scan.md` in ra,
và được giữ bằng với bản gốc theo hành vi chứ không theo chữ. Các biểu thức awk ở `secret-scan.md:105` đến `:126`
và biểu thức JavaScript không thể so sánh như chuỗi, vì hai bên khác dialect (`[[:space:]]` so với `\s`), nên
`tests/verify.sh` đưa một fixture gồm các dòng cho cả `tree` mode của scan `sh` lẫn module. Mỗi dòng được dựng
lúc chạy test để khớp đúng một dạng hoặc không dạng nào,
và check báo lỗi khi một dòng nhận nhãn khác.
Các glob của file credential là một mảng có đánh dấu, được đối chiếu với `secret-scan.md:55` đến `:60` như văn bản,
giống cách `cite-check.mjs` đang được kiểm.

Dạng khớp không phải là tất cả những gì lượt duyệt lịch sử phải giữ từ scan `sh`. Cách scan đó xử lý
các file mà rule 9 nêu tên cũng được chép lại, áp dụng cho một lịch sử: nội dung của file như vậy
bị loại khỏi luồng diff theo pathspec và không bao giờ được đọc (`secret-scan.md:62`, `:67`); một lượt
quét tên riêng trên mọi commit báo mọi file từng được thêm, và mọi file được đổi tên hay sao chép đi
thành một tên không còn khớp, với `-M` và `-C` như `secret-scan.md:79` đến `:83` làm; một file đi kèm
một `.pub` cùng tên, và một `.sql` hoặc `.csv` có blob quá một megabyte, đo bằng `git cat-file -s` và
không bao giờ được mở, như `:69` đến `:73` làm; và một khối private key được theo dõi qua nhiều dòng,
như `:165` đến `:167` làm. Các fixture của điểm rẽ 6 giữ từng phần này, nên một lượt duyệt đọc vào
một file môi trường, hay làm mất nó khi đổi tên, đều không qua được một check.

Bị loại: đọc `secret-scan.md` lúc chạy. Nó buộc script vào bố cục của một file Markdown, và một lần sửa phần văn xuôi
sẽ làm hỏng scan ở mọi project của người dùng, mà không có test nào chạy ở giữa.

### Điểm rẽ 2: định danh và host nội bộ, và các domain của công ty đến được script thế nào

`--delivery` yêu cầu `history-scan.mjs` thêm `--identities`, với các domain nội bộ truyền qua
`--internal <domain>[,<domain>]`. Các domain không được lưu lại. Khi người dùng không đưa vào, lượt chạy đề xuất
chúng từ chính lịch sử, gồm các domain của email committer và author, và host của remote, thành một câu hỏi
kèm đề xuất, rồi tiếp tục sau khi có câu trả lời. Report ghi ai đã xác nhận danh sách.
Host được báo khi nó kết thúc bằng một domain đã xác nhận, khi nó là một địa chỉ riêng (`10.0.0.0/8`,
`172.16.0.0/12`, `192.168.0.0/16`, `fc00::/7`) hoặc một tên loopback khác `localhost`, hoặc khi nó kết thúc bằng
`.internal`, `.local`, `.corp`, hoặc `.lan`.

Những gì được in ra trên stdout, thứ mà phiên đọc: một email dưới dạng `<redacted: email>@<domain>`, không bao giờ in
phần local part, vì phần đó nêu tên một người, còn domain là tất cả những gì việc phân loại cần; một host dưới dạng
`<redacted: host>.<domain>` với một domain đã xác nhận, hoặc dưới dạng loại của nó: `private address` hoặc
`internal suffix`, không bao giờ đầy đủ. Người phụ trách phải tìm và đánh giá từng cái, nên host đầy đủ chỉ đi vào
file được nêu bởi `--detail <path>`, file mà script tự ghi vào thư mục report của điểm rẽ 4 và phiên
không bao giờ đọc; stdout chỉ đưa đường dẫn đó và số đếm.

Bị loại: một dòng trong profile, mà `project-profile.md:180` đóng lại đối với các mục mới, cho một danh sách mà chỉ
một skill đọc; và một file override, vốn chứa chỉ dẫn cho skill chứ không chứa dữ liệu.

### Điểm rẽ 3: phiên bản đầu của lượt quét chuỗi cung ứng

Đọc từ các file đã track (`git ls-files`), trong phạm vi mà lượt chạy đã xác định:

| Hệ sinh thái | Đọc | Ứng viên |
|-----------|------|------------|
| GitHub Actions | `.github/workflows/*.yml`, `.yaml`, và `action.yml` composite cục bộ | một `uses:` của bên thứ ba không pin vào commit 40 ký tự hex; `pull_request_target`, được đánh dấu khi một job checkout head của pull request; `${{ github.event.* }}` hoặc `${{ github.head_ref }}` bên trong `run:`; `secrets: inherit` vào một reusable workflow; không có `permissions:` ở cấp workflow hoặc job |
| npm, pnpm, yarn | `package.json`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `.npmrc` | một dependency có install script (`hasInstallScript` trong lockfile v2 hoặc v3); một dependency không có scope khi `.npmrc` đặt một registry khác registry công khai; một manifest không có lockfile; một ứng viên typosquat |
| Python | `requirements*.txt`, `pip.conf`, `pyproject.toml`, `poetry.lock`, `uv.lock` | `--extra-index-url` hoặc `extra-index-url`; một file requirements không có hash hoặc lockfile; một ứng viên typosquat |

Mọi hệ sinh thái hoặc hệ thống CI khác trong phạm vi được liệt kê trong `not_scanned` theo tên, không bao giờ bị bỏ qua.
Một ứng viên typosquat là một tên có khoảng cách chỉnh sửa một hoặc hai so với một tên trong
`references/popular-packages.tsv` và bản thân không nằm trong danh sách. Danh sách là một `.tsv` theo quy ước
trong CLAUDE.md, mục "Skill folder layout", với các trường `ecosystem`, `name`, `checked`, do người bảo trì kit
làm mới trước một bản phát hành có đụng tới nó, và script in ra ngày `checked` cũ nhất mà nó đã dùng. YAML được
đọc bằng một bộ đọc theo dòng nhỏ nằm trong script, bao phủ các dạng trên, và báo một workflow không đọc được
thay vì đoán; không thêm dependency nào.

### Điểm rẽ 4: flag bàn giao và nơi report của nó được ghi

`--delivery`. Report và file `--detail` được ghi vào `<docs root>/derived/security/delivery/`, được git bỏ qua nhờ một file
ignore chứa `*` trong thư mục đó. File này được tạo khi còn thiếu, không bao giờ bị ghi đè, rồi được xác nhận bằng
`git check-ignore -q`, mẫu mà `shared/artifact-paths.md:144` và `:372` đã dùng, vì `docs/derived/` được track trừ khi
project bỏ qua nó (`:308`). Khi kiểm tra không qua, tức một negation trong `.gitignore` của project đè lên nó,
lượt chạy nói rõ điều đó và không ghi gì; không có phương án dự phòng là thư mục tạm, vì khởi động lại
sẽ xoá nó và Windows không làm nó riêng tư được. Record bảo mật của cùng lượt chạy, nếu có ghi, mang kết luận,
số đếm theo loại và đường dẫn tới report,
và không mang commit, path, domain hay host nào.

File ignore vẫn đi theo một bản sao hay archive của thư mục làm việc. Report nói rằng cách bàn giao repository là
câu hỏi của người phụ trách, và rằng bàn giao bằng cách sao chép hay archive sẽ xoá thư mục đó trước;
`references/delivery-readiness.md` liệt kê điều này cùng các lựa chọn.

Bị loại: một mục trong record bảo mật, hoặc một record riêng dưới `docs/records/security/`. Cả hai đều được commit
vào repository đang được bàn giao, nên khách hàng nhận danh sách những gì đang rò rỉ cùng với chính rò rỉ đó.
`shared/artifact-paths.md` thêm một dòng derived.

### Điểm rẽ 5: hợp đồng output và mã thoát

Mỗi script in ra một đối tượng JSON:

```json
{
  "tool": "history-scan", "version": 1, "complete": true, "incomplete_reason": null,
  "scanned": { "refs": 12, "commits": 3480, "binary_skipped": 41 },
  "hits": [ { "kind": "secret", "shape": "AWS access key", "commit": "a1b2c3d", "path": "config/prod.js", "line": 14, "at_head": "removed" } ],
  "not_scanned": []
}
```

`at_head` là `present` khi `HEAD` giữ cùng dòng đó tại path đó, `removed` khi path tồn tại mà không dòng nào bằng nó,
và `path-gone` khi path không còn. Phép so sánh được làm bên trong script; không dòng nào, cũng không hash của nó,
được in ra, vì hash của một secret ngắn có thể bị đảo ngược bằng cách thử các ứng viên. Các loại phát hiện là
`secret`, `credential-file`, `email`, `host`; `supply-chain-scan` dùng `candidate` với trường `rule` nêu tên hàng
của điểm rẽ 3, `path` và `line` của nó, và với một index hay registry thì host của nó,
đã bỏ mọi user và password. Một dòng của manifest hay file cấu hình không bao giờ được in, vì
`.npmrc`, `pip.conf` và một index URL có thể chứa login; một dạng secret trên dòng như vậy là
phát hiện của scan `tree`, không phải của script này.

Lượt duyệt yêu cầu git một dạng duy nhất, bất kể người dùng cấu hình gì,
như scan `sh` vẫn làm (`secret-scan.md:64` đến `:65`): `-c core.quotePath=false -c log.showSignature=false
-c diff.noprefix=false`, và `--no-color --no-ext-diff --no-textconv --src-prefix=a/
--dst-prefix=b/`, để một textconv driver hay git-crypt không làm thứ được đọc khác đi trên
một máy so với máy khác. Các commit merge được đọc với `-m`, mỗi commit đối chiếu với mọi parent,
nên một secret được thêm lúc giải quyết xung đột vẫn được thấy; một dòng mà merge chỉ mang lại
từ một parent được báo đúng một lần, tại commit đã thêm nó lần đầu.

`scanned.refs` liệt kê các ref đã duyệt theo tên. Một clone chỉ giữ những gì đã được fetch: một nhánh trên remote
chưa bao giờ được fetch, hoặc ref riêng của host như `refs/pull/*`, không được duyệt, và script không thể biết
về nó nếu không có mạng. Vì vậy output nêu remote nào mà clone có, và mỗi remote được fetch lần cuối khi nào,
lấy từ `FETCH_HEAD` khi có mặt, và không khẳng định gì ngoài các ref nó liệt kê.

Mã `0` khi lượt duyệt đã xong, bất kể tìm thấy gì. Mã `3` khi nó đã chạy nhưng chưa xong, như một shallow clone,
một ref không đọc được, hoặc hết giới hạn thời gian, với `complete: false` và lý do. Mã `2` khi nó không chạy được:
không phải repository, thiếu `git`, hoặc một đối số nó không nhận. Skill báo `3` là chưa xong và `2` là chưa chạy,
không bao giờ báo một trong hai là sạch, theo bước 2 của `SKILL.md`. Mọi kết quả khác, một tiến trình mà host đã
giết, một mã thoát khác, hoặc output không phải một đối tượng JSON hoàn chỉnh, được báo là chưa chạy, và
không có gì trong đó được đọc như một kết quả.

### Điểm rẽ 6: fixture và test

`tests/security-fixtures/` giữ các input an toàn để commit: file workflow và manifest,
mẫu tên phổ biến. Mọi lịch sử git và mọi giá trị có dạng bí mật được dựng lúc chạy test trong một thư mục tạm
bởi `tests/verify.sh`, các giá trị được ghép từ từng mảnh như `tests/verify.sh:301` làm,
nên không file nào được commit chứa một giá trị thật. Các kiểm tra: lượt quét lịch sử tìm một secret được commit
rồi xoá là `removed`, một secret vẫn còn là `present`, một file credential từng được commit,
và một email cùng một host nội bộ dưới `--identities`; một secret chỉ được thêm lúc giải quyết xung đột
của một merge; một file môi trường được commit, đổi tên thành một tên không còn khớp, rồi bị xoá;
một key đi kèm một `.pub`; cùng các kết quả đó với `diff.noprefix`, `core.quotePath` và một textconv driver
được cấu hình trong fixture; không giá trị, không phần local part và không host đầy đủ nào xuất hiện
trong stdout hay stderr của cả hai script, và không dòng nào của file môi trường được đọc; một shallow clone
thoát với mã `3`; các dạng khớp với scan `sh` (điểm rẽ 1); lượt quét chuỗi cung ứng báo từng ứng viên của điểm rẽ 3,
in một index URL có login với login đã bỏ đi, và liệt kê một hệ sinh thái lạ dưới `not_scanned`.
Trên Windows, các script được chạy bằng `node`, với `git` lấy từ `PATH`; bản thân `tests/verify.sh` vẫn chạy
dưới shell POSIX, như hiện nay.

### Điểm rẽ 7: không dùng mạng

Cả hai script không import `http`, `https`, `net`, `tls`, `dgram`, và không gọi `fetch`; `tests/verify.sh` grep hai
script và module để tìm các tên đó.
Dữ liệu advisory không bao giờ được tải về: một advisory về gói độc hại hay lỗ hổng
chỉ đến từ một scanner mà project đã chạy, theo dòng Malicious packages của giai đoạn 1.

### Skill dùng chúng thế nào

- Bước 2 thêm một mục History: `history-scan.mjs` trên mọi ref, chạy cạnh lượt quét `tree`, được khởi chạy nền ở nơi harness
  có thể chạy lệnh theo kiểu đó, để giới hạn thời gian mà host đặt cho một lệnh không cắt ngắn một lượt duyệt dài; còn nếu không
  thì chạy ở foreground, với việc bị giết được đọc là chưa chạy, theo điểm rẽ 5; một phát hiện có `at_head: removed`
  hoặc `path-gone` là Critical cho đến khi người phụ trách thu hồi credential, theo một dòng mới ở hàng Secrets in history
  của `threat-checklist.md`, và hàng đó cũng bỏ cụm
  "chỉ với một scanner mà project đã có". Record nêu commit, path,
  dòng và dạng.
- Bước 2 thêm một mục Supply chain: `supply-chain-scan.mjs`, mỗi ứng viên được phân loại theo
  `references/supply-chain.md` dựa trên tài sản của bước 1. Mục này cũng nêu những gì script không thấy được:
  quyền mà một workflow được cấp trong cài đặt repository, self-hosted runner trên một repository công khai,
  và các secret mà một tổ chức chia sẻ.
- `--delivery` chạy bước 1 với toàn bộ repository làm phạm vi, cả hai script, và `--identities`, rồi đến kết luận
  của `references/delivery-readiness.md`: `NOT READY` khi còn bất kỳ secret, file credential, hoặc email hay host
  nội bộ chưa xác nhận nào đang mở, và khi người phụ trách chưa xác nhận rằng các ref mà lượt quét liệt kê là mọi ref
  sẽ được bàn giao, vì một ref mà clone chưa bao giờ fetch thì chưa được duyệt (điểm rẽ 5); các host của chính khách hàng là
  thứ cần xác nhận, không phải rò rỉ. Các lựa chọn liệt kê cho người phụ trách, và không lựa chọn nào được chạy: thu hồi trước,
  bàn giao một lịch sử mới, viết lại lịch sử, ánh xạ định danh.
- Không có Node: mỗi script được báo là chưa chạy, và lịch sử vẫn là "chưa quét" trong record.

### Mô hình dữ liệu và migration

`N/A`: không có kho dữ liệu. Hình dạng record là của giai đoạn 1.

### Hợp đồng API

JSON của điểm rẽ 5 là hợp đồng giữa các script và references của skill, được đánh phiên bản bằng trường `version`.
Nó không phải một giao diện công khai của kit.

### Tương thích ngược

Thuần bổ sung. Một record viết trước thay đổi này vẫn hợp lệ. Một project mà override cấm một bước thì tiếp tục cấm nó:
các script do workflow của skill chạy, và một override có thể bỏ chúng như bỏ bất kỳ kiểm tra tự động nào,
kèm theo record nói rõ điều đó.

### Triển khai và hoàn tác

Giai đoạn 3, 4 và 5 của kế hoạch, mỗi giai đoạn một lần merge, và không độc lập với nhau.
`scripts/lib/secret-shapes.mjs` và các chỉnh sửa tài liệu nói rằng một skill `atk` mang script sẽ đi cùng
giai đoạn 3 hoặc 4, cái nào merge trước; giai đoạn 5 gọi script của giai đoạn 3. Hoàn tác chạy theo thứ tự ngược:
giai đoạn 5 trước giai đoạn 3; module và các chỉnh sửa tài liệu chỉ được gỡ khi không còn script nào nữa.
Không có gì được lưu lại phụ thuộc vào các script, nên một lần revert để workflow ở "lịch sử chưa quét".
Một lần revert chỉ đến người dùng dưới dạng một bản phát hành mới của `atk`, do release-please cắt từ `main`;
người dùng không cập nhật sẽ giữ các script họ đang có.

### Khả năng quan sát

JSON mang số đếm, `complete` và `not_scanned`; bảng Checks run của record trích lại chúng.

### Ảnh hưởng đến bảo mật và quyền

Các script chỉ đọc repository và không gì khác, chỉ khởi chạy `git`, và không gửi gì đi. Chúng ghi stdout, và `history-scan.mjs`
ghi file `--detail` của điểm rẽ 2 vào thư mục bị bỏ qua của điểm rẽ 4 và không nơi nào khác; thứ mà stdout mang
đi vào phiên và transcript của nó, đó là lý do nó không mang giá trị, phần local part hay host đầy đủ nào. Output nêu
commit, path và dòng của secret, bản thân nó đã nhạy cảm; vị trí report bàn giao là điểm rẽ 4,
còn record bảo mật giữ cơ chế che của giai đoạn 1.

### Hiệu năng

Lượt duyệt lịch sử là một luồng `git log -p -m --all` với các option của điểm rẽ 5, cộng thêm một
lượt chỉ lấy tên cho các file của điểm rẽ 1, đọc từng dòng, không có bộ đệm giữ cả lịch sử.
Thời gian tỉ lệ với số dòng được thêm vào của lịch sử; một repository có hàng chục nghìn commit
dự kiến mất vài phút, và `--max-seconds <n>` dừng lượt duyệt với mã `3` thay vì
chạy không giới hạn.

## Truy vết

| Tiêu chí | Design trả lời ở đâu |
|-----------|-----------------------------|
| AC6 | Điểm rẽ 3, `references/supply-chain.md`, mục Supply chain |
| AC7 | Điểm rẽ 1, `at_head` của điểm rẽ 5, mục History |
| AC8 | Điểm rẽ 2 và 4, `references/delivery-readiness.md`, `--delivery` |
| AC9 | Design này và ADR 0017 |

## Câu hỏi mở

Không có.

### Đã trả lời

| Câu hỏi | Câu trả lời | Người trả lời | Ngày |
|---------|-------------|---------------|------|
| Có đặt giới hạn thời gian mặc định không, hay chỉ khi có `--max-seconds`? | Không có giới hạn mặc định; chỉ `--max-seconds` mới dừng lượt duyệt | Lam Ngoc Khuong | 2026-11-09 |

## Pre-review objections

Mỗi vai trò một agent đưa ra trên bản nháp; đây là góc nhìn mô phỏng, không phải một lần review và không phải một lần duyệt.

| ID | Vai trò | Mục | Phản bác | Trả lời |
|----|------|---------|-----------|--------|
| O1 | TL | Điểm rẽ 5, Hiệu năng | Lượt duyệt không nêu git option nào, nên textconv driver, git-crypt, `diff.noprefix` hay `core.quotePath` làm thay đổi thứ được đọc trên từng máy; còn `git log -p` không in diff cho một merge, nên một secret thêm vào lúc giải quyết xung đột bị bỏ sót dù báo `complete: true` | Changed: điểm rẽ 5 nêu các option, theo `secret-scan.md:64`, và đọc merge với `-m`; điểm rẽ 6 kiểm một merge và từng cấu hình |
| O2 | Góc nhìn bảo mật | Điểm rẽ 5, Điểm rẽ 4 | `--all` chỉ duyệt các ref đã fetch, nên một nhánh chưa fetch hay `refs/pull/*` của một host không bao giờ được duyệt, trong khi kết quả vẫn báo complete | Changed: điểm rẽ 5 liệt kê các ref đã duyệt và các remote cùng lần fetch cuối; `--delivery` vẫn ở `NOT READY` cho tới khi người phụ trách xác nhận các ref được liệt kê là tất cả những gì sẽ được bàn giao |
| O3 | Góc nhìn bảo mật | Điểm rẽ 2, Điểm rẽ 5 | Stdout, thứ mà phiên và transcript của nó đọc, từng mang đầy đủ host nội bộ và các domain đã xác nhận, trái với tiêu chí 2 | Changed: stdout chỉ mang `<redacted: host>.<domain>` hoặc một loại; host đầy đủ chỉ đi vào file `--detail` trong thư mục bị bỏ qua |
| O4 | Góc nhìn bảo mật | Điểm rẽ 3, Điểm rẽ 5 | Một ứng viên chuỗi cung ứng nằm trên dòng index URL hay `.npmrc` có thể in ra login đi kèm | Changed: một ứng viên cho path, dòng, rule và host đã bỏ mọi login, không bao giờ in dòng đó; điểm rẽ 6 kiểm điều này |
| O5 | TL | Điểm rẽ 1 | Chỉ chép lại các dạng thì hoặc là đưa mọi file môi trường từng được commit đi qua script, hoặc bỏ sót file bị đổi tên trong lịch sử, và rơi mất các quy tắc về `.pub` và quy tắc cho file dump lớn | Changed: điểm rẽ 1 chép lại cách xử lý rule 9 áp dụng cho một lịch sử, và điểm rẽ 6 kiểm từng phần |
| O6 | TL | Điểm rẽ 4 | `docs/derived/` mặc định được track, nên dự phòng thư mục tạm sẽ thành đường đi thường, bị xoá khi khởi động lại và không riêng tư trên Windows; một archive của thư mục làm việc sẽ mang theo report đang bị bỏ qua | Changed: file ignore chứa `*` trong thư mục của report, không có dự phòng, và cảnh báo bàn giao bằng cách sao chép có trong report và reference của nó |
| O7 | TL | Skill dùng chúng thế nào, Hiệu năng | Khi không có giới hạn mặc định, một lượt duyệt dài bị giới hạn lệnh của host giết và không để lại JSON nào, nên có thể bị đọc thành sạch | Changed: lượt duyệt được chạy nền ở nơi harness làm được, và mọi kết quả khác một đối tượng JSON hoàn chỉnh với mã thoát `0`, `2` hoặc `3` đều được báo là chưa chạy; quyết định không có giới hạn mặc định vẫn giữ nguyên |
| O8 | TL | Triển khai và hoàn tác | Ba giai đoạn dùng chung một module và một dependency, nên revert một lần merge có thể làm hỏng lần khác, và một bản revert chỉ đến người dùng dưới dạng một bản phát hành | Changed: phần triển khai nêu sự ràng buộc và thứ tự ngược, và cách một bản revert đến người dùng |

Các agent đã chạy: hai, Tech Lead và góc nhìn bảo mật, mỗi agent là một agent tìm kiếm chỉ đọc của harness, chạy
trên model mặc định của nó, vì profile không nêu model cho agent review; agent `atk:read-only-reviewer` của kit
không có trong phiên bản đã cài. Các vai trò bị bỏ qua: QA,
SRE và BrSE/BA, không vai nào được nêu trong `.atk/profile.md` là người review design này. Nêu 10 phản bác, gộp 3
thành một, loại 0.

## ADR

`docs/adr/0017-security-scripts-for-history-and-supply-chain.md`.

## Người review

Lam Ngoc Khuong, Tech Lead, phê duyệt. Không có SRE hay cán bộ bảo mật nào được nêu tên trong `.atk/profile.md`.
