
"use client";

import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Row, Col, Card, Typography, Avatar, Tag, Button, Space, Input } from 'antd';
import { UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { posts } from '@/data/blog';
import React from 'react';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

// Helper to get post data
const getPost = (slug: string) => {
  return posts.find(post => post.slug === slug);
};

// Helper to get related posts
const getRelatedPosts = (currentSlug: string) => {
  return posts.filter(post => post.slug !== currentSlug).slice(0, 3);
};

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const post = getPost(slug);
  const relatedPosts = getRelatedPosts(slug);

  if (!post) {
    notFound();
  }

  const vocabulary = ["Vocabulary", "Highlight", "Learning", "Context", "Effective"];
  const cardHeaderStyle = { backgroundColor: '#fafafa', borderBottom: '1px solid #f0f0f0' };

  return (
    <div className="container mx-auto px-4 py-8">
      <Row gutter={[32, 32]}>
        {/* Main content */}
        <Col xs={24} lg={16}>
          <Card styles={{ body: { padding: 0 } }}>
            <div style={{ position: 'relative', width: '100%', height: '400px' }}>
              <Image
                src={post.imageUrl}
                alt={post.title}
                layout="fill"
                objectFit="cover"
                style={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
              />
            </div>
            <div style={{ padding: 24 }}>
              <Title level={2} style={{ marginTop: 0 }}>{post.title}</Title>
              <Space align="center" style={{ marginBottom: 16 }}>
                <Avatar icon={<UserOutlined />} src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                <Text type="secondary">Shadcn</Text>
                <CalendarOutlined style={{ color: 'rgba(0,0,0,.45)' }}/>
                <Text type="secondary">{post.date}</Text>
              </Space>
              <Typography>
                {post.content.split('\n\n').map((paragraph, index) => (
                    <Paragraph key={index}>{paragraph}</Paragraph>
                ))}
              </Typography>
            </div>
          </Card>
        </Col>

        {/* Sidebar - Updated Style */}
        <Col xs={24} lg={8}>
          <Space orientation="vertical" size="large" style={{ width: '100%' }}>
            <Card title="Search" styles={{ header: cardHeaderStyle }}>
                <Search placeholder="Search posts..." />
            </Card>
            
            <Card title="Vocabulary Highlights" styles={{ header: cardHeaderStyle }}>
              <Space wrap>
                {vocabulary.map(word => (
                  <Tag color="blue" key={word}>{word}</Tag>
                ))}
              </Space>
            </Card>

            <Card title="Related Posts" styles={{ header: cardHeaderStyle }}>
                <Space orientation="vertical" style={{ width: '100%' }} size="middle">
                    {relatedPosts.map(relatedPost => (
                        <Space key={relatedPost.slug} align="start">
                            <Link href={`/blog/${relatedPost.slug}`} passHref>
                                <div style={{ position: 'relative', width: '100px', height: '65px', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer' }}>
                                    <Image 
                                        src={relatedPost.imageUrl} 
                                        alt={relatedPost.title} 
                                        layout="fill"
                                        objectFit="cover"
                                    />
                                </div>
                            </Link>
                            <div>
                                <Link href={`/blog/${relatedPost.slug}`}>
                                    <Text strong style={{ display: 'block' }}>{relatedPost.title}</Text>
                                </Link>
                                <Text type="secondary">{relatedPost.date}</Text>
                            </div>
                        </Space>
                    ))}
                </Space>
            </Card>

            <Card title="Practice makes perfect!" styles={{ header: cardHeaderStyle }}>
                <Paragraph>Test your knowledge with related quizzes.</Paragraph>
                <Link href="/quizzes" passHref>
                    <Button type="primary" block>
                        Take a Quiz
                    </Button>
                </Link>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}
