import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  CircularProgress,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
} from '@mui/material';
import {
  Add,
  ToggleOn,
  ToggleOff,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import { format } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { adminService } from '../../services/adminService';
import { shiftService } from '../../services/shiftService';
import type { Shift, Doctor } from '../../types';

const schema = yup.object().shape({
  doctorId: yup.string().required('Bác sĩ là bắt buộc'),
  date: yup.date().required('Ngày là bắt buộc'),
  startTime: yup.string().required('Giờ bắt đầu là bắt buộc'),
  endTime: yup.string().required('Giờ kết thúc là bắt buộc'),
  maxPatient: yup.number().min(1, 'Số bệnh nhân tối thiểu là 1').required('Số bệnh nhân là bắt buộc'),
});

interface ShiftFormData {
  doctorId: string;
  date: Date;
  startTime: string;
  endTime: string;
  maxPatient: number;
}

const Shifts: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredShifts, setFilteredShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [filterDoctor, setFilterDoctor] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ShiftFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      doctorId: '',
      date: new Date(),
      startTime: '08:00',
      endTime: '17:00',
      maxPatient: 20,
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterShifts();
  }, [shifts, filterDoctor, filterStartDate, filterEndDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [shiftsData, doctorsData] = await Promise.all([
        adminService.getAllShifts(),
        adminService.getAllDoctors(),
      ]);
      setShifts(shiftsData);
      setDoctors(doctorsData);
    } catch (error) {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const filterShifts = () => {
    let filtered = [...shifts];

    if (filterDoctor) {
      filtered = filtered.filter((s) => s.doctorId === filterDoctor);
    }

    if (filterStartDate) {
      const startDateStr = format(filterStartDate, 'yyyy-MM-dd');
      filtered = filtered.filter((s) => s.date >= startDateStr);
    }

    if (filterEndDate) {
      const endDateStr = format(filterEndDate, 'yyyy-MM-dd');
      filtered = filtered.filter((s) => s.date <= endDateStr);
    }

    setFilteredShifts(filtered);
    setPage(0);
  };

  const handleOpenDialog = () => {
    reset({
      doctorId: '',
      date: new Date(),
      startTime: '08:00',
      endTime: '17:00',
      maxPatient: 20,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    reset();
  };

  const onSubmit = async (data: ShiftFormData) => {
    try {
      await shiftService.create({
        doctorId: data.doctorId,
        date: format(data.date, 'yyyy-MM-dd'),
        startTime: data.startTime,
        endTime: data.endTime,
        maxPatient: data.maxPatient,
      });
      toast.success('Ca làm đã được tạo thành công');
      handleCloseDialog();
      loadData();
    } catch (error) {
      toast.error('Không thể tạo ca làm');
    }
  };

  const handleToggleStatus = async (shift: Shift) => {
    try {
      const newStatus = shift.status === 'OPEN' ? 'CLOSED' : 'OPEN';
      await shiftService.updateStatus(shift.id, newStatus);
      toast.success(`Đã ${newStatus === 'OPEN' ? 'mở' : 'đóng'} ca làm`);
      loadData();
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái ca làm');
    }
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor?.name || doctorId;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold">
            Quản lý ca làm
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
            Tạo ca làm
          </Button>
        </Box>

        <Paper sx={{ borderRadius: 2, p: 3, mb: 3 }}>
          <Typography variant="h6" mb={2}>
            Bộ lọc
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Bác sĩ</InputLabel>
                <Select
                  value={filterDoctor}
                  onChange={(e) => setFilterDoctor(e.target.value)}
                  label="Bác sĩ"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <DatePicker
                label="Từ ngày"
                value={filterStartDate}
                onChange={(date) => setFilterStartDate(date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <DatePicker
                label="Đến ngày"
                value={filterEndDate}
                onChange={(date) => setFilterEndDate(date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ borderRadius: 2, p: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bác sĩ</TableCell>
                  <TableCell>Ngày</TableCell>
                  <TableCell>Giờ làm việc</TableCell>
                  <TableCell>Số bệnh nhân</TableCell>
                  <TableCell>Đã đặt</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredShifts
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((shift) => (
                    <TableRow key={shift.id} hover>
                      <TableCell>{getDoctorName(shift.doctorId)}</TableCell>
                      <TableCell>
                        {format(new Date(shift.date), 'dd/MM/yyyy', { locale: vi })}
                      </TableCell>
                      <TableCell>
                        {shift.startTime} - {shift.endTime}
                      </TableCell>
                      <TableCell>{shift.maxPatient}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${shift.bookedCount}/${shift.maxPatient}`}
                          color={shift.bookedCount >= shift.maxPatient ? 'error' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={shift.status === 'OPEN' ? 'Mở' : 'Đóng'}
                          color={shift.status === 'OPEN' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color={shift.status === 'OPEN' ? 'error' : 'success'}
                          onClick={() => handleToggleStatus(shift)}
                        >
                          {shift.status === 'OPEN' ? <ToggleOff /> : <ToggleOn />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredShifts.length}
            page={page}
            onPageChange={(_e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Số dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
          />
        </Paper>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogTitle>Tạo ca làm mới</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <Controller
                  name="doctorId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.doctorId}>
                      <InputLabel>Bác sĩ</InputLabel>
                      <Select {...field} label="Bác sĩ">
                        {doctors.map((doctor) => (
                          <MenuItem key={doctor.id} value={doctor.id}>
                            {doctor.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.doctorId && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                          {errors.doctorId.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Ngày"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.date,
                          helperText: errors.date?.message,
                        },
                      }}
                    />
                  )}
                />
                <Controller
                  name="startTime"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Giờ bắt đầu"
                      type="time"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.startTime}
                      helperText={errors.startTime?.message}
                    />
                  )}
                />
                <Controller
                  name="endTime"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Giờ kết thúc"
                      type="time"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.endTime}
                      helperText={errors.endTime?.message}
                    />
                  )}
                />
                <Controller
                  name="maxPatient"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Số bệnh nhân tối đa"
                      type="number"
                      error={!!errors.maxPatient}
                      helperText={errors.maxPatient?.message}
                    />
                  )}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Hủy</Button>
              <Button type="submit" variant="contained">
                Tạo
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Shifts;
