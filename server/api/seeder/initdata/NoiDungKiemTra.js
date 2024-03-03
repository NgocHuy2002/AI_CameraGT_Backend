export default [
  {
    ten_noi_dung: 'Hành lang tuyến',
    is_system: true,
    tieu_chi: [
      {
        ten_tieu_chi: 'Cây ở gần, cây gãy, đổ',
        tieu_chi_con: [
          {
            ten_tieu_chi: 'Cây rừng cao ngoài hành lang',
          },
          {
            ten_tieu_chi: 'Cây trồng cao ngoài hành lang',
          },
        ],
      },
      {
        ten_tieu_chi: 'Tình trạng hành lang tuyến',
        tieu_chi_con: [
          {
            ten_tieu_chi: 'Hành lang hạn chế tầm nhìn kiểm tra',
          },
          {
            ten_tieu_chi: 'Cây trồng vi phạm trong hành lang',
          },
          {
            ten_tieu_chi: 'Vật liệu, thực bì dễ cháy trong hành lang',
          },
          {
            ten_tieu_chi: 'Cây ngoài hành lang',
          },
        ],
      },
      {
        ten_tieu_chi: 'Công trình, kết cấu trong và ngoài hành lang',
        tieu_chi_con: [
          {
            ten_tieu_chi: 'Nhà, công trình xây dựng mới vi phạm trong hành lang',
          },
          {
            ten_tieu_chi: 'Phương tiện, thiết bị làm việc có nguy cơ vi phạm',
          },
        ],
      },
      {
        ten_tieu_chi: 'Thông tin về chặt cây, kế hoạch trồng cây',
        tieu_chi_con: [
          {
            ten_tieu_chi: 'Phối hợp giám sát đốt nương, rẫy, đất trồng rừng',
          },
          {
            ten_tieu_chi: 'Phối hợp giám sát khai thác cây',
          },
          {
            ten_tieu_chi: 'Phối hợp giám sát trồng mới',
          },
        ],
      },
    ],
  },
  {
    ten_noi_dung: 'Hệ thống nối đất',
    tieu_chi: [
      {
        ten_tieu_chi: 'Tiếp địa bị hư hỏng',
        tieu_chi_con: [
          {
            ten_tieu_chi: 'Tiếp địa nổi trên mặt đất',
          },
        ],
      },
      {
        ten_tieu_chi: 'Kết quả đo điện trở Không Đạt',
        is_system: true,
      },
    ],
  },
];
