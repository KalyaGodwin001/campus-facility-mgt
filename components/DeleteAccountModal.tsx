import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, CheckCircle } from "lucide-react"

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isDeletingAccount: boolean
  deletionSteps: string[]
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  isDeletingAccount,
  deletionSteps,
}: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setConfirmText("")
      setShowConfirmation(false)
    }
  }, [isOpen])

  const handleDeleteAccount = () => {
    if (confirmText === "DELETE") {
      setShowConfirmation(true)
    }
  }

  const handleFinalConfirmation = () => {
    onConfirm()
    setShowConfirmation(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
            Delete Account
          </DialogTitle>
          <DialogDescription className="text-lg">
            Are you sure you want to delete your account? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {!isDeletingAccount && !showConfirmation && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Label htmlFor="confirm" className="text-lg">
                Type DELETE to confirm
              </Label>
              <Input
                id="confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="text-lg mt-2"
              />
            </motion.div>
          )}
          {showConfirmation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Warning!</strong>
              <span className="block sm:inline"> This action is irreversible. Are you absolutely sure?</span>
            </motion.div>
          )}
          {isDeletingAccount && (
            <motion.div className="space-y-2">
              <p className="text-lg font-semibold">Deleting account...</p>
              <AnimatePresence>
                {deletionSteps.map((step, index) => (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="text-sm text-muted-foreground flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {step}
                  </motion.p>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
        <DialogFooter className="sm:justify-start">
          {!isDeletingAccount && !showConfirmation && (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={confirmText !== "DELETE"}>
                  Delete Account
                </Button>
              </motion.div>
            </>
          )}
          {showConfirmation && (
            <>
              <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                Go Back
              </Button>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="destructive" onClick={handleFinalConfirmation}>
                  Confirm Deletion
                </Button>
              </motion.div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

