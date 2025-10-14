import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const feedbackReasons = [
  { id: 'not_relevant', label: 'Not relevant to our services' },
  { id: 'budget_mismatch', label: 'Budget doesn\'t match our capacity' },
  { id: 'wrong_region', label: 'Wrong geographic region' },
  { id: 'timeline_issue', label: 'Timeline doesn\'t work for us' },
  { id: 'lack_expertise', label: 'We lack the required expertise' },
  { id: 'other', label: 'Other reason' }
];

export default function DislikeFeedbackDialog({ open, onOpenChange, opportunityTitle, onSubmit }) {
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [additionalFeedback, setAdditionalFeedback] = useState('');

  const toggleReason = (reasonId) => {
    setSelectedReasons(prev =>
      prev.includes(reasonId)
        ? prev.filter(id => id !== reasonId)
        : [...prev, reasonId]
    );
  };

  const handleSubmit = () => {
    // Simulate collecting feedback (not stored, just for UX)
    console.log('Feedback collected:', {
      reasons: selectedReasons,
      additionalFeedback
    });

    onSubmit();
    handleClose();
  };

  const handleClose = () => {
    setSelectedReasons([]);
    setAdditionalFeedback('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogClose onClick={handleClose} />
        <DialogHeader>
          <DialogTitle>Help Us Improve Your Matches</DialogTitle>
          <DialogDescription>
            Tell us why this opportunity isn't a good fit. This helps our AI learn your preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Opportunity title reminder */}
          <div className="p-3 bg-slate-50 rounded-md">
            <p className="text-sm font-medium text-slate-700 line-clamp-2">
              {opportunityTitle}
            </p>
          </div>

          {/* Reason checkboxes */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Why isn't this a good match?</Label>
            {feedbackReasons.map(reason => (
              <div key={reason.id} className="flex items-center gap-2">
                <Checkbox
                  id={reason.id}
                  checked={selectedReasons.includes(reason.id)}
                  onCheckedChange={() => toggleReason(reason.id)}
                />
                <Label
                  htmlFor={reason.id}
                  className="text-sm cursor-pointer font-normal"
                >
                  {reason.label}
                </Label>
              </div>
            ))}
          </div>

          {/* Additional feedback */}
          <div className="space-y-2">
            <Label htmlFor="additional-feedback" className="text-sm font-medium">
              Additional feedback (optional)
            </Label>
            <Textarea
              id="additional-feedback"
              value={additionalFeedback}
              onChange={(e) => setAdditionalFeedback(e.target.value)}
              placeholder="Any other details you'd like to share..."
              className="min-h-20 text-sm"
            />
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-md">
            <div className="text-xs text-blue-700">
              <strong>Note:</strong> Your feedback helps our AI learn your preferences and improve future recommendations. This information is used to enhance your experience.
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-neura-teal hover:bg-neura-lightTeal text-white"
          >
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
