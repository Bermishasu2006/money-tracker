package com.bermisha.money_tracker.repository;

import com.bermisha.money_tracker.model.Friend;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FriendRepository extends JpaRepository<Friend, Integer> {
}