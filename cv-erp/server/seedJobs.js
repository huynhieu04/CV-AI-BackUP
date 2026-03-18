/* // server/seedJobs.js
require('dotenv').config();
const connectDB = require('./config/db');
const Job = require('./models/job.model');

async function seedJobs() {
    try {
        await connectDB();

        // ❗ Nếu muốn giữ job cũ thì COMMENT 2 dòng dưới:
        await Job.deleteMany({});
        console.log('[SeedJobs] Đã xóa toàn bộ jobs cũ');

        const jobs = [
            {
                code: "JD-BE-001",
                title: "Backend Developer (NodeJS)",
                skillsRequired: [
                    "Node.js",
                    "Express.js",
                    "REST API",
                    "MongoDB hoặc SQL",
                    "Git",
                ],
                experienceRequired:
                    "0-2 năm kinh nghiệm Backend, chấp nhận fresher/intern",
                educationRequired:
                    "Sinh viên năm cuối hoặc tốt nghiệp ngành CNTT / Software Engineering",
                description: `
Phát triển API backend cho hệ thống web.
Thiết kế database, xử lý nghiệp vụ, tối ưu hiệu năng.
Phối hợp với team Frontend để tích hợp API.
                `,
            },
            {
                code: "JD-QA-001",
                title: "QA / Tester (Manual & Automation)",
                skillsRequired: [
                    "Testing cơ bản",
                    "Viết test case",
                    "Selenium WebDriver",
                    "Postman",
                    "Kiến thức SDLC / STLC",
                ],
                experienceRequired:
                    "0-1 năm, ưu tiên có kinh nghiệm làm project thực tế hoặc đồ án",
                educationRequired:
                    "CNTT, Hệ thống thông tin, hoặc ngành liên quan",
                description: `
Thực hiện test chức năng web / mobile.
Viết test case, test report, log bug lên hệ thống.
Có khả năng học và áp dụng automation test (Selenium, TestNG...).
                `,
            },
            {
                code: "JD-ACC-001",
                title: "Junior Accountant",
                skillsRequired: [
                    "Kế toán tài chính",
                    "Excel",
                    "Lập chứng từ",
                    "Đối chiếu sổ sách",
                ],
                experienceRequired:
                    "0-1 năm, chấp nhận sinh viên mới ra trường",
                educationRequired:
                    "Tốt nghiệp Cao đẳng/Đại học chuyên ngành Kế toán, Tài chính",
                description: `
Hỗ trợ nhập liệu chứng từ kế toán.
Đối chiếu công nợ, kiểm tra hóa đơn, hỗ trợ lập báo cáo tài chính.
Ưu tiên biết sử dụng phần mềm kế toán (MISA, Fast...).
                `,
            },
            {
                code: "JD-MKT-001",
                title: "Digital Marketing Executive",
                skillsRequired: [
                    "Facebook Ads",
                    "Content Marketing",
                    "Google Analytics",
                    "Social Media",
                ],
                experienceRequired:
                    "6 tháng - 2 năm Digital Marketing",
                educationRequired:
                    "Marketing, Truyền thông hoặc ngành liên quan",
                description: `
Lên kế hoạch và triển khai các chiến dịch digital (Facebook, TikTok...).
Viết nội dung cho fanpage, website.
Theo dõi, phân tích hiệu quả chiến dịch và tối ưu chi phí.
                `,
            },
            {
                code: "JD-UIUX-001",
                title: "UI/UX Designer",
                skillsRequired: [
                    "Figma hoặc Adobe XD",
                    "UI Design",
                    "UX Research cơ bản",
                    "Wireframe, Prototype",
                ],
                experienceRequired:
                    "0-2 năm kinh nghiệm thiết kế sản phẩm số",
                educationRequired:
                    "Thiết kế đồ họa, Multimedia, hoặc tự học có portfolio tốt",
                description: `
Thiết kế giao diện web/app theo yêu cầu sản phẩm.
Phối hợp với dev để bàn giao thiết kế, style guide.
Tham gia nghiên cứu trải nghiệm người dùng, đề xuất cải tiến UI/UX.
                `,
            },
        ];

        const inserted = await Job.insertMany(jobs);
        console.log(`[SeedJobs] Đã thêm ${inserted.length} job mẫu:`);
        inserted.forEach((j) => {
            console.log(` - ${j.code}: ${j.title}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('[SeedJobs] Lỗi:', err);
        process.exit(1);
    }
}

seedJobs();
 */