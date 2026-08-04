<?php
session_start();
session_destroy();
header('Location: ../staff-login.html');
exit;
