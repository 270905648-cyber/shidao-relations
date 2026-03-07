'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, Mic, MicOff, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// 互动类型枚举
const interactionTypes = [
  '办公室聊天',
  '单独谈话',
  '微信',
  '电话',
  '饭局',
  '礼物',
  '帮忙办事',
  '资助工作',
  '家长沟通',
  '试听课',
  '批量维护',
];

// 互动性质枚举
const natureTypes = ['工作必需', '履职延伸', '非必需社交'];

// 风险等级枚举
const riskLevels = ['低风险', '中风险', '高风险'];

interface Person {
  id: string;
  name: string;
  category: string;
}

interface QuickRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persons: Person[];
  onSuccess: () => void;
}

export default function QuickRecordDialog({
  open,
  onOpenChange,
  persons,
  onSuccess,
}: QuickRecordDialogProps) {
  // 表单状态
  const [personId, setPersonId] = useState('');
  const [type, setType] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [initiative, setInitiative] = useState<'主动' | '被动'>('被动');
  const [nature, setNature] = useState('工作必需');
  const [energyScore, setEnergyScore] = useState<number>(3);
  const [note, setNote] = useState('');

  // 复盘字段
  const [surfaceCost, setSurfaceCost] = useState('');
  const [hiddenGain, setHiddenGain] = useState('');
  const [emotionValue, setEmotionValue] = useState<number>(3);
  const [spreadTracking, setSpreadTracking] = useState('');
  const [riskLevel, setRiskLevel] = useState('');

  // UI状态
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 重置表单
  const resetForm = useCallback(() => {
    setPersonId('');
    setType('');
    setDuration(30);
    setInitiative('被动');
    setNature('工作必需');
    setEnergyScore(3);
    setNote('');
    setSurfaceCost('');
    setHiddenGain('');
    setEmotionValue(3);
    setSpreadTracking('');
    setRiskLevel('');
    setIsReviewOpen(false);
  }, []);

  // 当对话框关闭时重置表单
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  // 开始录音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('无法访问麦克风:', error);
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 转录音频
  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      // 将音频转换为 base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];

        const response = await fetch('/api/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audio: base64 }),
        });

        const data = await response.json();
        if (data.success && data.text) {
          setNote((prev) => (prev ? prev + ' ' + data.text : data.text));
        } else {
          alert('语音转文字失败: ' + (data.error || '未知错误'));
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('转录失败:', error);
      alert('语音转文字失败');
    } finally {
      setIsTranscribing(false);
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!personId || !type) {
      alert('请选择关联人物和互动类型');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personId,
          type,
          duration,
          initiative,
          nature,
          energyScore,
          note: note || null,
          surfaceCost: surfaceCost || null,
          hiddenGain: hiddenGain || null,
          emotionValue: emotionValue || null,
          spreadTracking: spreadTracking || null,
          riskLevel: riskLevel || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        onSuccess();
        onOpenChange(false);
      } else {
        alert('创建失败: ' + (data.error || '未知错误'));
      }
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 能量消耗星星显示
  const renderEnergyStars = (score: number, interactive: boolean = true) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setEnergyScore(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`h-5 w-5 ${
                star <= score
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  // 情绪价值星星显示
  const renderEmotionStars = (score: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setEmotionValue(star)}
            className="cursor-pointer hover:scale-110 transition-transform"
          >
            <Star
              className={`h-5 w-5 ${
                star <= score
                  ? 'fill-rose-400 text-rose-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-lg">📝</span>
            快速记录互动
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 关联人物 */}
          <div className="space-y-2">
            <Label htmlFor="person">关联人物</Label>
            <Select value={personId} onValueChange={setPersonId}>
              <SelectTrigger id="person" className="w-full">
                <SelectValue placeholder="选择人物" />
              </SelectTrigger>
              <SelectContent>
                {persons.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name} ({person.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 互动类型 */}
          <div className="space-y-2">
            <Label htmlFor="type">互动类型</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type" className="w-full">
                <SelectValue placeholder="选择互动类型" />
              </SelectTrigger>
              <SelectContent>
                {interactionTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 时长 */}
          <div className="space-y-2">
            <Label htmlFor="duration">时长（分钟）</Label>
            <Input
              id="duration"
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              className="w-32"
            />
          </div>

          {/* 主动/被动 */}
          <div className="space-y-2">
            <Label>主动/被动</Label>
            <RadioGroup
              value={initiative}
              onValueChange={(v) => setInitiative(v as '主动' | '被动')}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="主动" id="active" />
                <Label htmlFor="active" className="cursor-pointer">
                  主动
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="被动" id="passive" />
                <Label htmlFor="passive" className="cursor-pointer">
                  被动
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 互动性质 */}
          <div className="space-y-2">
            <Label htmlFor="nature">互动性质</Label>
            <Select value={nature} onValueChange={setNature}>
              <SelectTrigger id="nature" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {natureTypes.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 能量消耗 */}
          <div className="space-y-2">
            <Label>能量消耗</Label>
            {renderEnergyStars(energyScore)}
          </div>

          {/* 备注 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="note">备注</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                className={`gap-1 ${isRecording ? 'bg-red-50 text-red-600 hover:bg-red-100' : ''}`}
              >
                {isTranscribing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    转录中...
                  </>
                ) : isRecording ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    停止录音
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    语音输入
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="note"
              placeholder="输入互动备注..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          {/* 复盘字段（可折叠） */}
          <Collapsible open={isReviewOpen} onOpenChange={setIsReviewOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span>展开复盘字段</span>
                {isReviewOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              {/* 明面付出 */}
              <div className="space-y-2">
                <Label htmlFor="surfaceCost">明面付出</Label>
                <Textarea
                  id="surfaceCost"
                  placeholder="记录明面上的付出..."
                  value={surfaceCost}
                  onChange={(e) => setSurfaceCost(e.target.value)}
                  rows={2}
                />
              </div>

              {/* 隐形收益 */}
              <div className="space-y-2">
                <Label htmlFor="hiddenGain">隐形收益</Label>
                <Textarea
                  id="hiddenGain"
                  placeholder="记录隐形的收益..."
                  value={hiddenGain}
                  onChange={(e) => setHiddenGain(e.target.value)}
                  rows={2}
                />
              </div>

              {/* 对方情绪价值 */}
              <div className="space-y-2">
                <Label>对方情绪价值反馈</Label>
                {renderEmotionStars(emotionValue)}
              </div>

              {/* 舆论传播跟踪 */}
              <div className="space-y-2">
                <Label htmlFor="spreadTracking">舆论传播跟踪</Label>
                <Textarea
                  id="spreadTracking"
                  placeholder="记录舆论传播情况..."
                  value={spreadTracking}
                  onChange={(e) => setSpreadTracking(e.target.value)}
                  rows={2}
                />
              </div>

              {/* 风险等级 */}
              <div className="space-y-2">
                <Label htmlFor="riskLevel">风险等级</Label>
                <Select value={riskLevel} onValueChange={setRiskLevel}>
                  <SelectTrigger id="riskLevel" className="w-full">
                    <SelectValue placeholder="选择风险等级" />
                  </SelectTrigger>
                  <SelectContent>
                    {riskLevels.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                保存中...
              </>
            ) : (
              '保存'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
