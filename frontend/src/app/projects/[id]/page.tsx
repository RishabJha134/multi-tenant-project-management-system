'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Project, ProjectUser, User } from '@/types';

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [projectUsers, setProjectUsers] = useState<ProjectUser[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'owner' | 'developer' | 'viewer'>('developer');
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchProjectDetails();
    fetchProjectUsers();
  }, [user, projectId, router]);

  const fetchProjectDetails = async () => {
    try {
      const response = await api.get<Project>(`/projects/${projectId}`);
      setProject(response.data);
      setEditForm({
        name: response.data.name,
        description: response.data.description || '',
      });
    } catch (err: any) {
      console.error('Failed to fetch project:', err);
      if (err.response?.status === 403) {
        alert('You do not have access to this project');
        router.push('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectUsers = async () => {
    try {
      const response = await api.get<any[]>(`/projects/${projectId}/users`);
      setProjectUsers(response.data);

      // Fetch all users in the company for assignment
      const usersResponse = await api.get<User[]>('/auth/me');
      const currentUserData:User[] = usersResponse.data;
      // This is a workaround - ideally we'd have an endpoint to get all users in a client
      setAllUsers(currentUserData);
    } catch (err) {
      console.error('Failed to fetch project users:', err);
    }
  };

  const handleAssignUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await api.post(`/projects/${projectId}/users`, {
        userId: selectedUserId,
        role: selectedRole,
      });
      setShowAssignModal(false);
      setSelectedUserId('');
      setSelectedRole('developer');
      fetchProjectUsers();
      fetchProjectDetails();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign user');
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await api.put(`/projects/${projectId}`, editForm);
      setShowEditModal(false);
      fetchProjectDetails();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update project');
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user from the project?')) {
      return;
    }

    try {
      await api.delete(`/projects/${projectId}/users/${userId}`);
      fetchProjectUsers();
      fetchProjectDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove user');
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await api.put(`/projects/${projectId}/users/${userId}`, { role: newRole });
      fetchProjectUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Project not found</div>
      </div>
    );
  }

  const currentUserRole = project.projectUsers?.find(pu => pu.userId === user?.id)?.role;
  const isOwnerOrAdmin = currentUserRole === 'owner' || user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {project.name}
              </h1>
              <p className="text-gray-600">{project.description || 'No description'}</p>
            </div>
            <div className="flex gap-2">
              <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded">
                Your role: {currentUserRole}
              </span>
              {isOwnerOrAdmin && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-sm font-medium"
                >
                  Edit Project
                </button>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Created: {new Date(project.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
            {isOwnerOrAdmin && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
              >
                + Assign User
              </button>
            )}
          </div>

          {projectUsers.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No team members yet</p>
          ) : (
            <div className="space-y-3">
              {projectUsers.map((pu) => (
                <div
                  key={pu.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="font-medium text-gray-900">{pu.user?.email}</p>
                    <p className="text-sm text-gray-600">
                      Global Role: {pu.user?.role || 'N/A'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {isOwnerOrAdmin ? (
                      <select
                        value={pu.role}
                        onChange={(e) => handleUpdateUserRole(pu.userId, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="owner">Owner</option>
                        <option value="developer">Developer</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {pu.role}
                      </span>
                    )}

                    {isOwnerOrAdmin && pu.userId !== user?.id && (
                      <button
                        onClick={() => handleRemoveUser(pu.userId)}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Assign User Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Assign User to Project</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleAssignUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                  className="w-full bg-zinc-800 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter user ID"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can find user IDs in Postman or database
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="w-full bg-zinc-800 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="owner">Owner</option>
                  <option value="developer">Developer</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setError('');
                    setSelectedUserId('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Project</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  className="w-full bg-zinc-800 text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-zinc-800 text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
