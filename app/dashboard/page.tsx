"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, FileSpreadsheet, BarChart3, LogOut, Plus, Upload } from 'lucide-react'
import AgentForm from '@/components/agent-form'
import FileUpload from '@/components/file-upload'
import TaskDistributionComponent from '@/components/task-distribution'

interface User {
  _id: string
  email: string
  name: string
  role: string
}

interface Agent {
  _id: string
  name: string
  email: string
  mobile: string
  role: string
  createdAt: string
}

interface TaskDistribution {
  _id: string
  agentName: string
  agentEmail: string
  tasks: any[]
  assignedAt: string
  totalTasks: number
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [assignedTasks, setAssignedTasks] = useState<TaskDistribution[]>([])
  const [receivedTasks, setReceivedTasks] = useState<TaskDistribution[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        router.push('/')
      }
    } catch (error) {
      router.push('/')
    }
  }

  const fetchData = async () => {
    try {
      const [agentsRes, tasksRes] = await Promise.all([
        fetch('/api/agents'),
        fetch('/api/tasks')
      ])

      if (agentsRes.ok) {
        const agentsData = await agentsRes.json()
        setAgents(agentsData.agents)
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json()
        setAssignedTasks(tasksData.assignedTasks)
        setReceivedTasks(tasksData.receivedTasks)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const onAgentCreated = () => {
    fetchData()
  }

  const onTasksUploaded = () => {
    fetchData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const totalTasksAssigned = assignedTasks.reduce((sum, dist) => sum + dist.totalTasks, 0)
  const totalTasksReceived = receivedTasks.reduce((sum, dist) => sum + dist.totalTasks, 0)

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-blue-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-900">Task Manager</h1>
              <Badge variant="outline" className="border-blue-200 text-blue-600">
                {user?.role === 'admin' ? 'Administrator' : 'Agent'}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-blue-700">Welcome, {user?.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-blue-200">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="agents" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              {user?.role === 'admin' ? 'Agents' : 'Sub-Agents'}
            </TabsTrigger>
            <TabsTrigger value="upload" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Upload className="h-4 w-4 mr-2" />
              Upload Tasks
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Task Distribution
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-900">
                    Total {user?.role === 'admin' ? 'Agents' : 'Sub-Agents'}
                  </CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">{agents.length}</div>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-900">Tasks Assigned</CardTitle>
                  <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">{totalTasksAssigned}</div>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-900">Tasks Received</CardTitle>
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">{totalTasksReceived}</div>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-900">Distributions</CardTitle>
                  <Upload className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">{assignedTasks.length}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">Recent {user?.role === 'admin' ? 'Agents' : 'Sub-Agents'}</CardTitle>
                </CardHeader>
                <CardContent>
                  {agents.length === 0 ? (
                    <p className="text-blue-600">No {user?.role === 'admin' ? 'agents' : 'sub-agents'} created yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {agents.slice(0, 5).map((agent) => (
                        <div key={agent._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div>
                            <p className="font-medium text-blue-900">{agent.name}</p>
                            <p className="text-sm text-blue-600">{agent.email}</p>
                          </div>
                          <Badge variant="outline" className="border-blue-200 text-blue-600">
                            {agent.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">Recent Task Distributions</CardTitle>
                </CardHeader>
                <CardContent>
                  {assignedTasks.length === 0 ? (
                    <p className="text-blue-600">No task distributions yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {assignedTasks.slice(0, 5).map((dist) => (
                        <div key={dist._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div>
                            <p className="font-medium text-blue-900">{dist.agentName}</p>
                            <p className="text-sm text-blue-600">{dist.totalTasks} tasks</p>
                          </div>
                          <Badge variant="outline" className="border-blue-200 text-blue-600">
                            {new Date(dist.assignedAt).toLocaleDateString()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="agents">
            <AgentForm onAgentCreated={onAgentCreated} userRole={user?.role || 'agent'} />
            
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">
                  {user?.role === 'admin' ? 'Agents' : 'Sub-Agents'} List
                </CardTitle>
                <CardDescription className="text-blue-600">
                  Manage your {user?.role === 'admin' ? 'agents' : 'sub-agents'} and their details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {agents.length === 0 ? (
                  <Alert className="border-blue-200 bg-blue-50">
                    <AlertDescription className="text-blue-700">
                      No {user?.role === 'admin' ? 'agents' : 'sub-agents'} created yet. Create your first {user?.role === 'admin' ? 'agent' : 'sub-agent'} above.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agents.map((agent) => (
                      <Card key={agent._id} className="border-blue-200">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-blue-900">{agent.name}</h3>
                              <Badge variant="outline" className="border-blue-200 text-blue-600">
                                {agent.role}
                              </Badge>
                            </div>
                            <p className="text-sm text-blue-600">{agent.email}</p>
                            <p className="text-sm text-blue-600">{agent.mobile}</p>
                            <p className="text-xs text-blue-500">
                              Created: {new Date(agent.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <FileUpload onTasksUploaded={onTasksUploaded} />
          </TabsContent>

          <TabsContent value="tasks">
            <TaskDistributionComponent
              assignedTasks={assignedTasks} 
              receivedTasks={receivedTasks}
              userRole={user?.role || 'agent'}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
