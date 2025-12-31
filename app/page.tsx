
"use client";

import { Card, Button, Row, Col } from 'antd';
import Link from "next/link";
import Image from 'next/image';
import {
  BulbOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

const { Meta } = Card;

export default function HomePage() {
  // Giả sử có hook `useSession` để kiểm tra trạng thái đăng nhập
  const session = null; // Thay thế bằng logic lấy session thực tế

  const features = [
    {
      icon: <BulbOutlined />,
      title: "Làm bài trắc nghiệm",
      description: "Tham gia vào các bài kiểm tra tương tác với nhiều loại câu hỏi khác nhau. Nhận phản hồi tức thì để cải thiện kiến thức.",
      image: "https://images.unsplash.com/photo-1517404215738-15263e9f9178?q=80&w=2070&auto=format&fit=crop",
    },
    {
      icon: <CheckCircleOutlined />,
      title: "Xem kết quả & Giải thích",
      description: "Xem lại câu trả lời của bạn, hiểu rõ các giải thích chi tiết cho từng câu hỏi và theo dõi sự tiến bộ của bạn theo thời gian.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    },
    {
      icon: <BarChartOutlined />,
      title: "Quản lý và Phân tích",
      description: "Quản lý tất cả các bài trắc nghiệm của bạn ở một nơi. Theo dõi hiệu suất của người làm bài và có được những hiểu biết có giá trị.",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Luyện tập và Đánh giá Kiến thức của bạn
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                    Nền tảng trắc nghiệm tương tác giúp bạn học tập hiệu quả, tạo bài kiểm tra dễ dàng và theo dõi tiến độ một cách trực quan.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/quizzes">
                    <Button type="primary" size="large">Khám phá các Bài trắc nghiệm</Button>
                  </Link>
                  {session && (
                    <Link href="/quizzes/new">
                      <Button size="large">Tạo Bài trắc nghiệm</Button>
                    </Link>
                  )}
                </div>
              </div>
              <Image
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                height="550"
                src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2132&auto=format&fit=crop"
                width="550"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
                  Tính năng chính
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Mọi thứ bạn cần cho việc Học và Dạy
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Từ việc làm bài kiểm tra đến tạo và quản lý nội dung, nền tảng của chúng tôi cung cấp một bộ công cụ toàn diện.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-5xl pt-8 sm:pt-12 md:pt-16">
                 <Row gutter={[24, 24]}>
                    {features.map((feature) => (
                        <Col xs={24} sm={12} lg={8} key={feature.title}>
                            <Card
                                variant="borderless"
                                className="h-full bg-gray-50 dark:bg-gray-900"
                                cover={
                                    <Image
                                        alt={feature.title}
                                        src={feature.image}
                                        width={550}
                                        height={310}
                                        className="aspect-video object-cover"
                                    />
                                }
                            >
                                <Meta
                                    avatar={<span className="text-2xl text-primary">{feature.icon}</span>}
                                    title={<h3 className="text-lg font-semibold">{feature.title}</h3>}
                                    description={<p className="text-gray-500 dark:text-gray-400">{feature.description}</p>}
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
               <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Quy trình sử dụng</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                    Bắt đầu học và tạo quiz chỉ trong ba bước đơn giản.
                </p>
            </div>
            <div className="relative mt-12">
              <div className="absolute left-1/2 top-0 h-full w-px bg-gray-200 dark:bg-gray-700 hidden md:block" />
              <div className="grid gap-8 md:grid-cols-3">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">1</div>
                  <h3 className="text-xl font-bold">Chọn Quiz</h3>
                  <p className="text-gray-500">Duyệt qua thư viện hoặc tìm kiếm một bài trắc nghiệm cụ thể.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">2</div>
                  <h3 className="text-xl font-bold">Làm bài</h3>
                  <p className="text-gray-500">Trả lời các câu hỏi và nhận điểm số ngay lập tức.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">3</div>
                  <h3 className="text-xl font-bold">Xem kết quả & Giải thích</h3>
                  <p className="text-gray-500">Xem lại câu trả lời và học hỏi từ những giải thích chi tiết.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
           <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
             <div className="space-y-4 text-center lg:text-left">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                    Sẵn sàng để Nâng cao Kiến thức của bạn?
                </h2>
                <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed lg:mx-0 lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                    Tham gia cùng hàng ngàn người học và nhà giáo dục. Bắt đầu ngay hôm nay!
                </p>
                 <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center lg:justify-start">
                    <Link href="/quizzes">
                        <Button type="primary" size="large">Bắt đầu Học</Button>
                    </Link>
                    {!session && (
                        <Link href="/login">
                        <Button size="large">Đăng ký Miễn phí</Button>
                        </Link>
                    )}
                    {session && (
                        <Link href="/quizzes/new">
                        <Button size="large">Tạo Quiz mới</Button>
                        </Link>
                    )}
                </div>
            </div>
            <Image
                alt="CTA Image"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
                height="310"
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070&auto=format&fit=crop"
                width="550"
            />
        </div>
        </section>
      </main>
    </div>
  );
}
