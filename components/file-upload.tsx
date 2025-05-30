"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Upload, FileSpreadsheet, CheckCircle } from 'lucide-react'

interface FileUploadProps {
  onTasksUploaded: () => void
}

interface Distribution {
  agentName: string
  agentEmail: string
  taskCount: number
}

export default function FileUpload({ onTasksUploaded }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [distributions, setDistributions] = useState<Distribution[]>([])
  const [uploadStats, setUploadStats] = useState<{
    totalTasks: number
    totalAgents: number
  } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError('')
      setMessage('')
      setDistributions([])
      setUploadStats(null)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file to upload')
      return
    }

    setLoading(true)
    setMessage('')
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Tasks distributed successfully!')
        setDistributions(data.distributions)
        setUploadStats({
          totalTasks: data.totalTasks,
          totalAgents: data.totalAgents
        })
        setFile(null)
        onTasksUploaded()
        
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        setError(data.error || 'Upload failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <Upload className="h-5 w-5 mr-2" />
            Upload Task File
          </CardTitle>
          <CardDescription className="text-blue-600">
            Upload a CSV or Excel file containing tasks to distribute among agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-700">{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload" className="text-blue-900">
                Select File (CSV, XLS, XLSX)
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={handleFileChange}
                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="text-sm text-blue-600">
                File must contain columns: FirstName, Phone, Notes
              </p>
            </div>

            {file && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">{file.name}</span>
                  <Badge variant="outline" className="border-blue-200 text-blue-600">
                    {(file.size / 1024).toFixed(1)} KB
                  </Badge>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading || !file}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing and Distributing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload and Distribute Tasks
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {uploadStats && distributions.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-900">
              <CheckCircle className="h-5 w-5 mr-2" />
              Distribution Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-900">{uploadStats.totalTasks}</div>
                <div className="text-sm text-green-600">Total Tasks</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-900">{uploadStats.totalAgents}</div>
                <div className="text-sm text-green-600">Total Agents</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-900">
                  {Math.floor(uploadStats.totalTasks / uploadStats.totalAgents)}
                </div>
                <div className="text-sm text-green-600">Tasks per Agent</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-green-900">Agent Distribution:</h4>
              {distributions.map((dist, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                  <div>
                    <p className="font-medium text-green-900">{dist.agentName}</p>
                    <p className="text-sm text-green-600">{dist.agentEmail}</p>
                  </div>
                  <Badge className="bg-green-600 text-white">
                    {dist.taskCount} tasks
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">File Format Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Required Columns:</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li><strong>FirstName</strong> - Contact's first name (Text)</li>
                <li><strong>Phone</strong> - Contact's phone number (Number)</li>
                <li><strong>Notes</strong> - Additional notes or comments (Text)</li>
              </ul>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Supported Formats:</h4>
              <div className="flex space-x-2">
                <Badge variant="outline" className="border-blue-200 text-blue-600">CSV</Badge>
                <Badge variant="outline" className="border-blue-200 text-blue-600">XLS</Badge>
                <Badge variant="outline" className="border-blue-200 text-blue-600">XLSX</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
