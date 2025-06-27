// app/post/[id]/page.js

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { ArrowLeft, Edit, Trash2, Calendar, User } from "lucide-react";
import { apiRequest } from "@/lib/apiRequest";
import { toast } from "react-hot-toast"; // Assuming you use a toast library

/**
 * [FIX] generateStaticParams provides the list of all post IDs to Next.js at build time.
 * This is required for static export (`output: 'export'`).
 * This function runs on the server during the build process.
 */
export async function generateStaticParams() {
  try {
    // Fetch all posts to get their IDs.
    // This endpoint should return an array of all post objects.
    const posts = await apiRequest('/posts');

    // Return the data in the format Next.js expects: [{ id: '1' }, { id: '2' }, ...]
    // Ensure the `id` is a string.
    return posts.map((post) => ({
      id: String(post.id),
    }));
  } catch (error) {
    console.error("Failed to fetch posts for generateStaticParams:", error);
    // Return an empty array to prevent the entire build from failing
    // if the API is down. No post pages will be generated in this case.
    return [];
  }
}

// Your page can remain a Client Component to use hooks like useState and useEffect.
"use client";

export default function PostPage({ params }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  // [FIX] Correctly access `id` directly from the `params` prop.
  // The `use()` hook is not needed here.
  const { id: postId } = params;

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const data = await apiRequest(`/posts/${postId}`);
        setPost(data);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post. It may have been deleted or the link is incorrect.");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  async function handleDelete() {
    // The `postId` is already available in the component's scope.
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        // Assuming your apiRequest can handle DELETE and auth.
        await apiRequest(`/posts/${postId}`, { method: 'DELETE' });
        toast.success("Post deleted successfully!");
        router.push("/"); // Redirect to homepage after deletion
        router.refresh(); // Refresh server components on the homepage
      } catch (err) {
        console.error("Error deleting post:", err);
        toast.error(err.message || "Failed to delete post.");
      }
    }
  }

  // --- JSX (Largely the same, with minor improvements) ---

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <Link href="/">
                  <Button className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-6">
              <div className="flex justify-between items-start mb-4">
                <Badge variant={post.published ? "default" : "secondary"}>{post.published ? "Published" : "Draft"}</Badge>
                {/* Note: Logic for showing/hiding these buttons based on user auth should be added */}
                <div className="flex items-center gap-2">
                  <Link href={`/edit/${post.id}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive" // Use a more appropriate variant for destructive actions
                    size="sm"
                    onClick={handleDelete}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>

              <CardTitle className="text-4xl font-extrabold leading-tight mb-4">{post.title}</CardTitle>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>By {post.author?.name || 'Unknown Author'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="prose prose-lg max-w-none prose-p:text-gray-800 prose-p:leading-relaxed">
                <div className="whitespace-pre-wrap">{post.content}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}