"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, FileSpreadsheet, Calendar, ChevronDown, ChevronUp, Eye } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface Task {
  FirstName: string
  Phone: string
  Notes: string
}

interface TaskDistribution {
  _id: string
  agentName: string
  agentEmail: string
  tasks: Task[]
  assignedAt: string
  totalTasks: number
  status: string
  completionPercentage?: number
}

interface TaskDistributionProps {
  assignedTasks: TaskDistribution[]
  receivedTasks: TaskDistribution[]
  userRole: string
}

export default function TaskDistribution({ assignedTasks, receivedTasks, userRole }: TaskDistributionProps) {
  const [expandedTasks, setExpandedTasks] = useState<string[]>([])

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks((prev) => (prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]))
  }

  const updateTaskStatus = async (distributionId: string, status: string, completedTasks?: number) => {
    try {
      const response = await fetch(`/api/tasks/${distributionId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, completedTasks }),
      })

      if (response.ok) {
        // Refresh data after update
        window.location.reload()
      }
    } catch (error) {
      console.error("Error updating task status:", error)
    }
  }

  const TaskCard = ({ distribution, type }: { distribution: TaskDistribution; type: "assigned" | "received" }) => {
    const isExpanded = expandedTasks.includes(distribution._id)

    return (
      <Card key={distribution._id} className="border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-blue-900">{distribution.agentName}</CardTitle>
              <CardDescription className="text-blue-600">{distribution.agentEmail}</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                className={`${
                  distribution.status === "completed"
                    ? "bg-green-600"
                    : distribution.status === "in-progress"
                      ? "bg-yellow-600"
                      : "bg-blue-600"
                } text-white`}
              >
                {distribution.totalTasks} tasks
              </Badge>
              <Badge
                variant="outline"
                className={`border-${
                  distribution.status === "completed"
                    ? "green"
                    : distribution.status === "in-progress"
                      ? "yellow"
                      : "blue"
                }-200 text-${
                  distribution.status === "completed"
                    ? "green"
                    : distribution.status === "in-progress"
                      ? "yellow"
                      : "blue"
                }-600`}
              >
                {distribution.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4 text-sm text-blue-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(distribution.assignedAt).toLocaleString()}
              </div>
              <div className="flex items-center">
                <FileSpreadsheet className="h-4 w-4 mr-1" />
                {distribution.totalTasks} tasks
              </div>
            </div>
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleTaskExpansion(distribution._id)}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {isExpanded ? "Hide" : "View"} Tasks
                  {isExpanded ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                {isExpanded && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2 p-2 bg-blue-50 rounded-lg text-sm font-medium text-blue-900">
                      <div>First Name</div>
                      <div>Phone</div>
                      <div>Notes</div>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {distribution.tasks.map((task, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-3 gap-2 p-2 bg-white border border-blue-100 rounded text-sm"
                        >
                          <div className="text-blue-900 font-medium">{task.FirstName}</div>
                          <div className="text-blue-700">{task.Phone}</div>
                          <div className="text-blue-600 truncate" title={task.Notes}>
                            {task.Notes}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
          {distribution.completionPercentage !== undefined && (
            <div className="mt-2">
              <div className="flex justify-between text-sm text-blue-600 mb-1">
                <span>Progress</span>
                <span>{distribution.completionPercentage}%</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${distribution.completionPercentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="assigned" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white border border-blue-200">
          <TabsTrigger value="assigned" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-2" />
            Tasks I Assigned ({assignedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="received" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Tasks Assigned to Me ({receivedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="space-y-4">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">
                Tasks I Assigned to {userRole === "admin" ? "Agents" : "Sub-Agents"}
              </CardTitle>
              <CardDescription className="text-blue-600">
                View and manage task distributions you have created
              </CardDescription>
            </CardHeader>
          </Card>

          {assignedTasks.length === 0 ? (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-700">
                No task distributions found. Upload a file to distribute tasks among your{" "}
                {userRole === "admin" ? "agents" : "sub-agents"}.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {assignedTasks.map((distribution) => (
                <TaskCard key={distribution._id} distribution={distribution} type="assigned" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="received" className="space-y-4">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Tasks Assigned to Me</CardTitle>
              <CardDescription className="text-blue-600">
                View tasks that have been assigned to you by administrators
              </CardDescription>
            </CardHeader>
          </Card>

          {receivedTasks.length === 0 ? (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-700">No tasks have been assigned to you yet.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {receivedTasks.map((distribution) => (
                <TaskCard key={distribution._id} distribution={distribution} type="received" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Summary Statistics */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Distribution Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-900">
                {assignedTasks.reduce((sum, dist) => sum + dist.totalTasks, 0)}
              </div>
              <div className="text-sm text-blue-600">Total Tasks Assigned</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-900">
                {receivedTasks.reduce((sum, dist) => sum + dist.totalTasks, 0)}
              </div>
              <div className="text-sm text-blue-600">Total Tasks Received</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-900">{assignedTasks.length}</div>
              <div className="text-sm text-blue-600">Distributions Created</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-900">{receivedTasks.length}</div>
              <div className="text-sm text-blue-600">Distributions Received</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
