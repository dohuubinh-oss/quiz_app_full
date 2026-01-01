'use client';

import { posts } from '@/data/blog';
import { Card, Input, Typography, Row, Col } from 'antd';
import Link from 'next/link';
import Image from 'next/image';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

const BlogPage = () => {
  const recentPosts = [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <Title level={1}>My Blog</Title>
        <Paragraph className="text-lg text-gray-600">Insights, tutorials, and updates on learning English.</Paragraph>
      </div>

      <Row gutter={[32, 32]}>
        {/* Main Content */}
        <Col xs={24} md={16}>
          <div className="space-y-8">
            {posts.map((post) => (
              <Card key={post.slug} hoverable className="w-full">
                <Link href={`/blog/${post.slug}`} passHref>
                  <div>
                    <div className="relative h-64 w-full mb-4">
                        <Image
                            src={post.imageUrl}
                            alt={post.title}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-t-lg"
                        />
                    </div>
                    <div className="p-6">
                      <Title level={3}>{post.title}</Title>
                      <Text type="secondary" className="block mb-4">{new Date(post.date).toLocaleDateString()}</Text>
                      <Paragraph ellipsis={{ rows: 3 }}>{post.content.replace(/<[^>]*>?/gm, '')}</Paragraph>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </Col>

        {/* Sidebar */}
        <Col xs={24} md={8}>
          <aside className="sticky top-8 space-y-8">
            {/* Search Bar */}
            <Card>
              <Title level={4}>Search</Title>
              <Search placeholder="Search posts..." />
            </Card>

            {/* Recent Posts */}
            <Card>
              <Title level={4}>Recent Posts</Title>
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.slug} className="flex items-start space-x-4">
                    <div className="w-1/3 flex-shrink-0">
                      <Link href={`/blog/${post.slug}`} passHref>
                        <div className="relative h-20 w-full overflow-hidden rounded-lg"> 
                          <Image
                            src={post.imageUrl}
                            alt={post.title}
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                      </Link>
                    </div>
                    <div className="w-2/3">
                      <Link href={`/blog/${post.slug}`} className="font-semibold text-gray-800 hover:text-blue-500 block">
                          {post.title}
                      </Link>
                      <p className="text-sm text-gray-500">{new Date(post.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </aside>
        </Col>
      </Row>
    </div>
  );
};

export default BlogPage;
