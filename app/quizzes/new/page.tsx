"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Typography,
  Button,
  Form,
  Input,
  Card,
  message,
  Upload,
  Modal,
} from "antd";
import { useCreateQuiz } from "@/api/hooks/useQuizzes";
import { useAuth } from "@/lib/auth";
import { InboxOutlined, PlusOutlined } from "@ant-design/icons";
import { uploadCoverImage } from "@/lib/storage";
import Image from "next/image";

const { Title } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

export default function NewQuizPage() {
  const router = useRouter();
  const createQuizMutation = useCreateQuiz();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleCreateQuiz = async (values: any) => {
    try {
      setUploading(true);
      let coverImageUrl = null;

      // Upload cover image if selected
      if (coverImage && user) {
        coverImageUrl = await uploadCoverImage(coverImage, user.id);
        if (!coverImageUrl) {
          message.error("Failed to upload cover image");
          setUploading(false);
          return;
        }
      }

      const newQuiz = await createQuizMutation.mutateAsync({
        title: values.title,
        description: values.description,
        published: false,
        cover_image: coverImageUrl,
        author_id: user?.id || "",
      });

      message.success("Quiz created successfully");
      router.push(`/quizzes/${newQuiz.id}`);
    } catch (error) {
      message.error("Failed to create quiz");
      setUploading(false);
    }
  };

  const handleImageChange = (info: any) => {
    // We're not actually uploading here, just storing the file
    setCoverImage(info.file);

    // Create a preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(info.file);
  };

  const uploadProps = {
    name: "file",
    multiple: false,
    accept: "image/*",
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("Image must be smaller than 2MB!");
      }
      return isImage && isLt2M ? false : Upload.LIST_IGNORE;
    },
    customRequest: ({ onSuccess }: any) => {
      setTimeout(() => {
        onSuccess("ok", null);
      }, 0);
    },
  };

  return (
    <div>
      <Title level={2} className="mb-6">
        Create New Quiz
      </Title>

      <Card>
        <Form form={form} layout="vertical" onFinish={handleCreateQuiz}>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input placeholder="Quiz title" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter a description" }]}
          >
            <TextArea rows={4} placeholder="Quiz description" />
          </Form.Item>

          <Form.Item label="Cover Image">
            {previewImage ? (
              <div className="relative">
                <div
                  className="relative w-full h-48 mb-4 cursor-pointer"
                  onClick={() => setPreviewVisible(true)}
                >
                  <Image
                    src={previewImage || "/placeholder.svg"}
                    alt="Cover preview"
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setCoverImage(null);
                    setPreviewImage(null);
                  }}
                >
                  Change Image
                </Button>
              </div>
            ) : (
              <Dragger {...uploadProps} onChange={handleImageChange}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Support for a single image upload. Please upload an image
                  smaller than 2MB.
                </p>
              </Dragger>
            )}
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={uploading}>
              Create Quiz
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        open={previewVisible}
        title="Cover Image Preview"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        {previewImage && (
          <img
            alt="Cover preview"
            style={{ width: "100%" }}
            src={previewImage || "/placeholder.svg"}
          />
        )}
      </Modal>
    </div>
  );
}
