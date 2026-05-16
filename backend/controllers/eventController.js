const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isApproved: true };
    if (category && category !== 'all') query.category = category;

    const events = await Event.find(query)
      .populate('organizer', 'name avatar department')
      .sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, location, category, maxCapacity, tags } = req.body;
    if (!title || !description || !date || !location) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const isApproved = req.user.role === 'admin';
    const event = await Event.create({
      title,
      description,
      date,
      location,
      category,
      maxCapacity,
      tags,
      organizer: req.user._id,
      isApproved
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.registeredStudents.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }
    if (event.registeredStudents.length >= event.maxCapacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    event.registeredStudents.push(req.user._id);
    await event.save();
    res.json({ message: 'Successfully registered for the event!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.unregisterFromEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.registeredStudents = event.registeredStudents.filter(
      (student) => student.toString() !== req.user._id.toString()
    );
    await event.save();
    res.json({ message: 'Unregistered from event' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
